import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EmptyStateProps {
  type: "chats" | "sent" | "received";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
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

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
