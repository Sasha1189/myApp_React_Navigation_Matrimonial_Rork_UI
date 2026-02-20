import React, { useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../../theme/useTheme";
import { useProfileContext } from "src/context/ProfileContext";
import { useChatSession } from "../hooks/useChatSession";
import { formatTime } from "../../../utils/dateUtils";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { useAppNavigation } from "src/navigation/hooks";
import { ChatRouteProp } from "../type/chattype";

export default function ChatScreen({ route }: { route: ChatRouteProp }) {
  const theme = useTheme();
  const { roomId, otherUser, uid } = route.params;
  const { profile } = useProfileContext();
  const sender = {
    uid,
    name: profile?.fullName || "User",
    photo: profile?.thumbnail,
  };

  const flatListRef = useRef<FlatList>(null);
  const navigation = useAppNavigation();

  const {
    messages,
    isLoading,
    isOtherTyping,
    otherStatus,
    isLoadingEarlier,
    hasMore,
    loadEarlier,
    setMyTyping,
    sendMessage,
  } = useChatSession(roomId, uid, sender, otherUser);

  // HEADER STATUS LOGIC
  const getHeaderStatus = () => {
    if (isOtherTyping) return "typing...";
    if (otherStatus?.state === "online") return "Online";
    return otherStatus?.lastChanged
      ? `Last seen ${formatTime(otherStatus.lastChanged)}`
      : "Offline";
  };

  useLayoutEffect(() => {
    if (!otherUser?.uid) return;

    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={styles.headerContainer}>
          <Image
            source={
              otherUser?.photo
                ? { uri: otherUser.photo }
                : require("../../../../assets/images/profile.png")
            }
            style={styles.headerAvatar}
            cachePolicy="disk"
          />
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.name || "Chat"}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                isOtherTyping && { color: theme.colors.primary },
              ]}
            >
              {getHeaderStatus()}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherUser, isOtherTyping, otherStatus]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          {isLoading && messages.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={[...messages].reverse()}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} isMe={item.s === uid} />
              )}
              contentContainerStyle={styles.listContent}
              initialNumToRender={20}
              removeClippedSubviews={Platform.OS === "android"}
              maxToRenderPerBatch={10}
              windowSize={5}
              ListFooterComponent={
                messages.length >= 50 && hasMore ? (
                  <LoadMoreButton
                    onPress={loadEarlier}
                    isLoading={isLoadingEarlier}
                  />
                ) : (
                  <View style={{ height: 20 }} />
                )
              }
            />
          )}
          <ChatInput
            onSend={(text) => {
              sendMessage(text);
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            }}
            onType={(isTyping) => setMyTyping(isTyping)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 10, paddingVertical: 20 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -20,
  },
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  headerName: { fontSize: 16, fontWeight: "700", color: "#000" },
  headerStatus: { fontSize: 11, color: "#4CAF50" }, // Green for online
});

// Load More Button Component to be moved to a separate file if needed
const LoadMoreButton = ({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) => (
  <View style={styless.loadMoreContainer}>
    {isLoading ? (
      <ActivityIndicator size="small" color="#007AFF" />
    ) : (
      <TouchableOpacity onPress={onPress} style={styless.loadBtn}>
        <Text style={styless.loadText}>Load earlier messages</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styless = StyleSheet.create({
  loadMoreContainer: {
    marginBottom: 10,
    marginTop: 20,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  loadBtn: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
