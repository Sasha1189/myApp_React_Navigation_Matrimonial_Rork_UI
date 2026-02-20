import React, { useCallback, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SendHorizonal } from "lucide-react-native";
import { debounce } from "lodash";
import { useTheme } from "../../../theme/useTheme";

interface ChatInputProps {
  onSend: (text: string) => void;
  onType: (isTyping: boolean) => void;
}

export const ChatInput = React.memo(({ onSend, onType }: ChatInputProps) => {
  const [text, setText] = useState("");
  const theme = useTheme();

  const stopTypingDebounced = useCallback(
    // 🔹 This will be called after the debounce delay
    debounce(() => onType(false), 2000), // 🔹 Wait 2 seconds before saying "Stopped"
    [],
  );

  const handleTextChange = (val: string) => {
    setText(val);

    if (val.length > 0) {
      onType(true); // 🔹 Signal "I am typing" immediately
      stopTypingDebounced(); // 🔹 This will "overwrite" the previous stop timer
    } else {
      onType(false); // 🔹 If they delete everything, stop immediately
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
      onType(false); // 🔹 Ensure status clears immediately on send
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
        <SendHorizonal size={24} color={theme.colors.textLight} />
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
