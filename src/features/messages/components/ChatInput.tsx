import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SendHorizonal } from "lucide-react-native";
import { useTheme } from "../../../theme/useTheme";

interface ChatInputProps {
  onSend: (text: string) => void;
  onType: (isTyping: boolean) => void;
}

export const ChatInput = React.memo(({ onSend, onType }: ChatInputProps) => {
  const [text, setText] = useState("");
  const theme = useTheme();

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.length > 0) {
      onType(true); // Triggers 'setTyping(true)' and 'stopTypingDebounced()'
    } else {
      onType(false);
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder="Type a message..."
        placeholderTextColor="gray"
        value={text}
        onChangeText={handleTextChange}
        multiline
      />
      <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
        <SendHorizonal size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "#EEE",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  sendBtn: { marginLeft: 10, padding: 5 },
});
