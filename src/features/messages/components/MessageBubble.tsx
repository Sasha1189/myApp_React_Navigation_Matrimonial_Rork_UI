import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { IMessage } from "../type/chattype";
import { ReadStatus } from "./ReadStatus";
import { Ionicons } from "@expo/vector-icons";

export const MessageBubble = React.memo(
  ({
    message,
    isMe,
    onLongPress,
  }: {
    message: IMessage;
    isMe: boolean;
    onLongPress?: (msg: IMessage) => void;
  }) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);

    // Manage local trash icon state visibility
    const [showTrash, setShowTrash] = useState(false);

    if (!theme) return null;

    return (
      <Pressable
        onPress={() => {
          if (showTrash) setShowTrash(false);
        }}
        disabled={!showTrash}
        style={[
          styles.rowContainer,
          {
            justifyContent: isMe ? "flex-end" : "flex-start",
            backgroundColor: showTrash
              ? theme.colors.primary + "10"
              : "transparent",
          },
        ]}
      >
        {/* --- MAIN MESSAGE CARD BUBBLE --- */}
        <Pressable
          onLongPress={() => {
            if (isMe) setShowTrash(true);
          }}
          onPress={() => {
            if (showTrash) setShowTrash(false);
          }}
          delayLongPress={400}
          style={({ pressed }) => [
            {
              alignSelf: isMe ? "flex-end" : "flex-start",
              backgroundColor: isMe ? theme.colors.primary + "20" : "#ECECEC",
              padding: 10,
              margin: 5,
              borderRadius: 15,
              maxWidth: "80%",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ fontSize: 16 }}>{message.t}</Text>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "flex-end",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 10, color: "gray", marginRight: 4 }}>
              {new Date(message.ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isMe && (
              <ReadStatus isRead={message.r} isPending={message.pending} />
            )}
          </View>
        </Pressable>

        {/* --- INLINE TRASH BIN BUTTON --- */}
        {isMe && showTrash && (
          <Pressable
            onPress={() => {
              if (onLongPress) onLongPress(message);
              setShowTrash(false);
            }}
            style={({ pressed }) => [
              styles.trashContainer,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </Pressable>
        )}
      </Pressable>
    );
  },
);

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    trashContainer: {
      padding: 10,
      marginRight: 5,
    },
  });
