//gemini code...

import React, { useRef, useCallback } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { useChatRoom } from "../hooks/useChatRoom";
import { useSendMessage } from "../hooks/useSendMessage";
import { useTypingStatus } from "../hooks/useTypingStatus";
import { useReadReceipts } from "../hooks/useReadReceipts";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { TypingIndicator } from "../components/TypingIndicator";

export default function ChatScreen({ route }: { route: any }) {
  const theme = useTheme();
  const { roomId, otherUser = {}, uid } = route.params || {};
  const flatListRef = useRef<FlatList>(null);

  // 🔹 1. DATA HOOKS (Aggressive & Offline-First)
  const { messages, isLoading } = useChatRoom(roomId);
  const { mutate: sendMessage } = useSendMessage(roomId, uid);
  const { isOtherTyping, setTyping } = useTypingStatus(
    roomId,
    uid,
    otherUser.uid,
  );

  // 🔹 2. AUTOMATIC SYNC (Double Ticks)
  useReadReceipts(roomId, uid);

  // 🔹 3. ACTIONS
  const handleSend = useCallback(
    (text: string) => {
      if (text.trim().length === 0) return;
      sendMessage(text);
      setTyping(false);

      // Inverted list: index 0 is the bottom (newest)
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [sendMessage, setTyping],
  );

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
              // 🔹 Inverted logic: Reverse the array for bottom-to-top rendering
              data={[...messages].reverse()}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} isMe={item.s === uid} />
              )}
              contentContainerStyle={styles.listContent}
              // Important: This allows the list to shrink when keyboard opens
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              // 🔹 Performance optimizations for long chats
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
              ListHeaderComponent={
                isOtherTyping ? (
                  <TypingIndicator name={otherUser.fullName} />
                ) : null
              }
            />
          )}

          <ChatInput
            onSend={handleSend}
            onType={(isTyping) => setTyping(isTyping)}
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
});
