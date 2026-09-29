import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SendHorizonal } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface ChatInputProps {
  onSend: (text: string) => void;
  onType: (isTyping: boolean) => void;
  canSend?: boolean;
}

export const ChatInput = React.memo(
  ({ onSend, onType, canSend = true }: ChatInputProps) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);

    const [text, setText] = useState("");
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

    const handleSend = () => {
      const cleanText = text.trim();
      if (!cleanText) return;

      // 👈 Check limit before allowing send
      if (!canSend) {
        Alert.alert(
          "Daily Limit Reached 🌙",
          "You've hit your message limit for today. Don't worry, your quota will reset at midnight!",
          [{ text: "Okay" }],
        );
        return;
      }

      clearTypingStatus(); // 4. Stop typing status immediately when message is sent
      onSend(cleanText);
      setText("");
    };

    if (!theme) return null;
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
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
          style={[
            styles.sendBtn,
            { opacity: text.trim().length > 0 ? 1 : 0.5 },
          ]}
          disabled={text.trim().length === 0}
        >
          <SendHorizonal size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    );
  },
);

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 0.5,
      backgroundColor: theme.colors.primary,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 10,
      fontSize: 16,
      marginRight: 8,
      color: theme.colors.background,
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
    },
  });
