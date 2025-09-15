import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Send } from "lucide-react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { theme } from "../../../constants/theme";
import { useChatRoom, type ChatMessage } from "../hooks/useChatRoom";

export default function ChatScreen() {
  const route = useRoute();
  const { otherUserId, otherUserName } = route.params as {
    otherUserId: string;
    otherUserName: string;
  };

  const { user } = useAuth();
  const currentUserId = user?.uid;

  const { messages, hasMore, loadingMore, loadMoreMessages, sendMessage } =
    useChatRoom(currentUserId, otherUserId);

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Auto scroll
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isSent ? styles.sentMessageText : styles.receivedMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kebcontainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          // onEndReached={loadMoreMessages}
          // onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" /> : null
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              sendMessage(inputText);
              setInputText("");
            }}
            disabled={!inputText.trim()}
          >
            <Send
              size={20}
              color={
                inputText.trim() ? theme.colors.primary : theme.colors.textLight
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  kebcontainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  messageText: {
    fontSize: theme.fontSize.md,
  },
  sentMessageText: {
    color: "white",
  },
  receivedMessageText: {
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: theme.spacing.md,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
