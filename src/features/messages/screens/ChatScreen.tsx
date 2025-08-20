import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send } from "lucide-react-native";
import { useRoute } from "@react-navigation/native";
import { theme } from "../../../constants/theme";
import { useMatches } from "../../../hooks/useAppStore";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatMessage {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const route = useRoute();
  const { matchId } = route.params as { matchId: string };
  // const { matchId } = useLocalSearchParams();
  const matches = useMatches();
  const match = matches.find((m) => m.id === matchId);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hey! How are you?",
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      text: "I'm great! How about you?",
      isSent: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ]);

  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isSent: true,
      timestamp: new Date(),
    };

    setMessages([newMessage, ...messages]);
    setInputText("");
  };

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

  if (!match) {
    return (
      <View style={styles.container}>
        <Text>Match not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kebcontainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesContainer}
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
            onPress={sendMessage}
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
