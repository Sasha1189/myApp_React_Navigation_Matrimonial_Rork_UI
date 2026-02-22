// import React, { useCallback, useState, useRef } from "react";
// import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
// import { SendHorizonal } from "lucide-react-native";
// import { debounce } from "lodash";
// import { useTheme } from "../../../theme/useTheme";

// interface ChatInputProps {
//   onSend: (text: string) => void;
//   onType: (isTyping: boolean) => void;
// }

// export const ChatInput = React.memo(({ onSend, onType }: ChatInputProps) => {
//   const [text, setText] = useState("");
//   const theme = useTheme();
//   const isTypingRef = useRef(false);
//   const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// ...................................................................................................
//   // const handleTextChange = (val: string) => {
//   //   setText(val);

//   //   if (val.length > 0) {
//   //     onType(true); // 🔹 Signal "I am typing" immediately
//   //     stopTypingDebounced(); // 🔹 This will "overwrite" the previous stop timer
//   //   } else {
//   //     onType(false); // 🔹 If they delete everything, stop immediately
//   //   }
//   // };.
//   const handleTextChange = (val: string) => {
//     setText(val);

//     // 1. Clear any existing "Stop" timer because the user is active
//     if (stopTypingTimeoutRef.current) {
//       clearTimeout(stopTypingTimeoutRef.current);
//     }

//     if (val.length > 0) {
//       // 2. ONLY signal "Start" if we aren't already marked as typing
//       if (!isTypingRef.current) {
//         isTypingRef.current = true;
//         onType(true); // Hits RTDB once
//       }

//       // 3. Set a timer to signal "Stop" after 2 seconds of silence
//       stopTypingTimeoutRef.current = setTimeout(() => {
//         isTypingRef.current = false;
//         onType(false); // Hits RTDB once
//       }, 2000);
//     } else {
//       // 4. If they clear the input, stop typing status immediately
//       isTypingRef.current = false;
//       onType(false);
//     }
//   };

//   const handleSend = () => {
//     if (text.trim()) {
//       onSend(text.trim());
//       setText("");
//       onType(false); // 🔹 Ensure status clears immediately on send
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
//       <TextInput
//         style={[styles.input, { color: theme.colors.text }]}
//         placeholder="Type a message..."
//         placeholderTextColor="gray"
//         value={text}
//         onChangeText={handleTextChange}
//         multiline
//       />
//       <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
//         <SendHorizonal size={24} color={theme.colors.textLight} />
//       </TouchableOpacity>
//     </View>
//   );
// });

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     padding: 10,
//     alignItems: "center",
//     borderTopWidth: 0.5,
//     borderColor: "#EEE",
//   },
//   input: {
//     flex: 1,
//     maxHeight: 100,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//   },
//   sendBtn: { marginLeft: 10, padding: 5 },
// });
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
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

  // Refs to manage typing state without triggering re-renders
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // 1. Cleanup: Ensure timers are cleared if the component unmounts
  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (val: string) => {
    setText(val);

    // 2. Clear any existing "Stop" timer because the user is actively typing
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    if (val.length > 0) {
      // 3. Start Typing: Only signal "true" if we aren't already marked as typing
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onType(true); // Signal to Hook -> RTDB
      }

      // 4. Set a timer to signal "Stop" after 2 seconds of silence
      stopTypingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onType(false); // Signal to Hook -> RTDB
      }, 2000);
    } else {
      // 5. If they delete everything, stop typing status immediately
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onType(false);
      }
    }
  };

  const handleSend = () => {
    const cleanText = text.trim();
    if (cleanText) {
      // 6. Stop typing immediately on send
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      isTypingRef.current = false;
      onType(false);

      // 7. Send and Reset
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
      />

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
    borderTopColor: "rgba(0,0,0,0.1)",
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
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // Alignment with text input baseline
  },
});
