import React from "react";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { IMessage } from "../type/chattype";
import { View, Text, StyleSheet } from "react-native";
import { ReadStatus } from "./ReadStatus";

export const MessageBubble = React.memo(
  ({ message, isMe }: { message: IMessage; isMe: boolean }) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);
    if (!theme) return null;

    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe ? theme.colors.primary + "20" : "#ECECEC",
          padding: 10,
          margin: 5,
          borderRadius: 15,
          maxWidth: "80%",
        }}
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
      </View>
    );
  },
);
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
  });
