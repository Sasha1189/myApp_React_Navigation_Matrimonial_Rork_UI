import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SendHorizonal } from "lucide-react-native";
import { useTheme } from "../../../theme/useTheme";

interface ChatInputProps {
  onSend: (text: string) => void;
  onType: (isTyping: boolean) => void;
}

export const ChatInput = React.memo(({ onSend, onType }: ChatInputProps) => {
  const [text, setText] = useState("");
  const theme = useTheme();
  const MAX_CHARS = 100;

  // Refs to manage typing state without triggering re-renders
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Helper to safely clear typing status
  const clearTypingStatus = () => {
    if (stopTypingTimeoutRef.current)
      clearTimeout(stopTypingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onType(false);
    }
  };

  // 1. Cleanup: Ensure timers are cleared if the component unmounts
  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, []);

  // const handleTextChange = (val: string) => {
  //   setText(val);

  //   // 2. Clear any existing "Stop" timer because the user is actively typing
  //   if (stopTypingTimeoutRef.current) {
  //     clearTimeout(stopTypingTimeoutRef.current);
  //   }

  //   if (val.length > 0) {
  //     // 3. Start Typing: Only signal "true" if we aren't already marked as typing
  //     if (!isTypingRef.current) {
  //       isTypingRef.current = true;
  //       onType(true); // Signal to Hook -> RTDB
  //     }

  //     // 4. Set a timer to signal "Stop" after 2 seconds of silence
  //     stopTypingTimeoutRef.current = setTimeout(() => {
  //       isTypingRef.current = false;
  //       onType(false); // Signal to Hook -> RTDB
  //     }, 2000);
  //   } else {
  //     // 5. If they delete everything, stop typing status immediately
  //     if (isTypingRef.current) {
  //       isTypingRef.current = false;
  //       onType(false);
  //     }
  //   }
  // };
  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current)
        clearTimeout(stopTypingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (val: string) => {
    setText(val);

    // 1. If text is cleared, stop typing immediately
    if (val.trim().length === 0) {
      clearTypingStatus();
      return;
    }

    // 2. Start Typing if not already active
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onType(true);
    }

    // 3. Reset the "Stop" timer every time a key is pressed (Debounce)
    if (stopTypingTimeoutRef.current)
      clearTimeout(stopTypingTimeoutRef.current);

    stopTypingTimeoutRef.current = setTimeout(() => {
      clearTypingStatus();
    }, 2000); // 2 seconds of silence = stop typing
  };

  // const handleSend = () => {
  //   const cleanText = text.trim();
  //   if (cleanText) {
  //     // 6. Stop typing immediately on send
  //     if (stopTypingTimeoutRef.current) {
  //       clearTimeout(stopTypingTimeoutRef.current);
  //     }
  //     isTypingRef.current = false;
  //     onType(false);

  //     // 7. Send and Reset
  //     onSend(cleanText);
  //     setText("");
  //   }
  // };
  const handleSend = () => {
    const cleanText = text.trim();
    if (cleanText) {
      clearTypingStatus(); // 4. Stop typing status immediately when message is sent
      onSend(cleanText);
      setText("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <TextInput
        style={[styles.input, { color: theme.colors.background }]}
        placeholder="Type a message..."
        placeholderTextColor="#888"
        value={text}
        onChangeText={handleTextChange}
        multiline
        maxLength={MAX_CHARS}
      />
      {text.length > MAX_CHARS * 0.8 && (
        <View>
          <Text style={styles.counter}>{MAX_CHARS - text.length}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSend}
        style={[styles.sendBtn, { opacity: text.trim().length > 0 ? 1 : 0.5 }]}
        disabled={text.trim().length === 0}
      >
        <SendHorizonal size={24} color={theme.colors.background} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120, // Prevents input from taking over the whole screen
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // Alignment with text input baseline
  },
  counter: {
    fontSize: 16,
    // color: theme.colors.textLight,
  },
});
