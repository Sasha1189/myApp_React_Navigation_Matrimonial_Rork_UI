import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useChatSession } from "../hooks/useChatSession";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useAppNavigation } from "src/navigation/hooks";
import { ChatListHelper } from "../components/ChatListHelper";
import { ChatHeader } from "../components/ChatHeader";
import { AppStackScreenProps } from "src/navigation/types";
import { IMessage } from "../type/chattype";
import { useMyProfile } from "@/features/profile/context/ProfileContext";

export default function ChatScreen({ route }: AppStackScreenProps<"Chat">) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const { roomId, otherUser, uid } = route.params;
  const { myProfile } = useMyProfile();
  const sender = {
    uid,
    name: myProfile?.fn || "User",
    photo: myProfile?.tn,
  };
  const flatListRef = useRef<FlatList>(null);
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    deleteMessage,
    getStatusLabel,
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
    styles,
  });

  useLayoutEffect(() => {
    if (!otherUser?.uid) return;
    navigation.setOptions({
      headerTitle: () => (
        <ChatHeader
          name={otherUser.name}
          photo={otherUser.photo}
          statusLabel={getStatusLabel()}
          isTyping={isOtherTyping}
          isOnline={otherStatus?.state === "online"}
        />
      ),
    });
  }, [
    navigation,
    otherUser,
    isOtherTyping,
    otherStatus,
    getStatusLabel,
    theme,
  ]);

  // 2. Define the pop-up menu trigger function:
  const handleMessageLongPress = (messageItem: IMessage) => {
    Alert.alert(
      "Delete message?",
      "This message will be permanently removed from this chat room.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete for Everyone",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(messageItem);
            } catch (err) {
              Alert.alert("Error", "Could not delete this message. Try again.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (!theme) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      style={styles.container}
    >
      <View style={styles.inner}>
        {isLoading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={getGroupedMessages(messages)}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.isDateBanner) {
                return (
                  <View
                    style={{
                      alignItems: "center",
                      marginVertical: 14,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#EAEAEA",
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {item.dateText}
                      </Text>
                    </View>
                  </View>
                );
              }
              return (
                <ChatBubble
                  message={item}
                  isMe={item.s === uid}
                  onLongPress={handleMessageLongPress}
                />
              );
            }}
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
      </View>
      <View style={{ paddingBottom: keyboardVisible ? 0 : insets.bottom }}>
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
  );
}
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1 },
    center: {
      flex: 1,
      marginHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
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

// Helper function for inverted lists to inject date banner items
const getGroupedMessages = (messages: any[]) => {
  const items: any[] = [];

  for (let i = 0; i < messages.length; i++) {
    const currentMsg = messages[i];
    items.push(currentMsg);

    const currentDateStr = new Date(currentMsg.ts).toDateString();

    // In an inverted list, the next index (i + 1) is older. We look at the item before (i - 1) which is newer chronologically.
    const olderMsg = messages[i + 1];
    const olderDateStr = olderMsg ? new Date(olderMsg.ts).toDateString() : null;

    // If there is no older message, or the date changes between currentMsg and olderMsg, insert a banner
    if (!olderDateStr || currentDateStr !== olderDateStr) {
      const msgDate = new Date(currentMsg.ts);
      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let dateText = "";
      if (currentDateStr === todayStr) {
        dateText = "Today";
      } else if (currentDateStr === yesterdayStr) {
        dateText = "Yesterday";
      } else {
        dateText = msgDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      items.push({
        id: `date-banner-${currentMsg.id}`,
        isDateBanner: true,
        dateText,
      });
    }
  }

  return items;
};
