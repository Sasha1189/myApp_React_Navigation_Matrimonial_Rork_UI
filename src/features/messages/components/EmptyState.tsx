import React from "react";
import { View, Text } from "react-native";
import { styles } from "../screens/MessagesScreen";

interface EmptyStateProps {
  type: "chats" | "sent" | "received";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  //   const styles = styles;

  const title =
    type === "chats"
      ? "No messages yet"
      : type === "sent"
      ? "No likes sent yet"
      : "No likes received yet";

  const subtitle =
    type === "chats"
      ? "When you match with someone, you can message them here!"
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
