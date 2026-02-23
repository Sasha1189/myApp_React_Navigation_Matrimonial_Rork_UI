import React, { useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { theme } from "../../../theme/index";
import { useProfileContext } from "src/context/ProfileContext";
import { useChatSession } from "../hooks/useChatSession";
import { formatTime } from "../../../utils/dateUtils";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { useAppNavigation } from "src/navigation/hooks";
import { ChatRouteProp } from "../type/chattype";
import { ChatListHelper } from "../components/ChatListHelper";

export default function ChatScreen({ route }: { route: ChatRouteProp }) {
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
    isLoadingEarlier,
    isOtherTyping,
    otherStatus,
    hasMore,
    isLive,
    hasNewAtBottom,
    loadEarlier,
    setMyTyping,
    sendMessage,
    resetToLive,
  } = useChatSession(roomId, uid, sender, otherUser);

  const helper = ChatListHelper({
    isLive,
    hasMore,
    theme,
    isLoadingMore: isLoadingEarlier,
    hasNewContent: hasNewAtBottom,
    onLoadMore: loadEarlier,
    onReset: () => {
      resetToLive();
      flatListRef.current?.scrollToOffset({ offset: 0 });
    },
    mode: "chat",
  });

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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
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
              data={messages}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} isMe={item.s === uid} />
              )}
              contentContainerStyle={styles.listContent}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={Platform.OS === "android"}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
              ListFooterComponent={helper.renderFooter}
            />
          )}
          {helper.renderFloating()}
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

export const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingBottom: 10,
  },
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
  loadMoreBtn: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
