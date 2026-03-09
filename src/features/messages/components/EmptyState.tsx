import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface EmptyStateProps {
  type: "chats" | "sent" | "received";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const title =
    type === "chats"
      ? "No messages yet"
      : type === "sent"
        ? "No likes sent yet"
        : "No likes received yet";

  const subtitle =
    type === "chats"
      ? "Start messaging them!"
      : type === "sent"
        ? "Start liking profiles to see them here!"
        : "When someone likes you, they will appear here!";
  if (!theme) return null;
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{subtitle}</Text>
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    emptySubtext: {
      fontSize: 14,
      color: "gray",
      textAlign: "center",
    },
  });
