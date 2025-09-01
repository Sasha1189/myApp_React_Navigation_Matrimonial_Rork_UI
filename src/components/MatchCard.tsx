import React from "react";
import { useAppNavigation } from "../navigation/hooks";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { Match } from "../types/profile";
import { theme } from "../constants/theme";

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigation = useAppNavigation();
  // const formatTime = (date: Date) => {
  //   const now = new Date();
  //   const diff = now.getTime() - date.getTime();
  //   const hours = Math.floor(diff / (1000 * 60 * 60));
  //   const days = Math.floor(hours / 24);

  //   if (days > 0) return `${days}d ago`;
  //   if (hours > 0) return `${hours}h ago`;
  //   return 'Just now';
  // };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("Chat", { matchId: match.id })}
      // router.push(`/chat/${match.id}`)}
    >
      <Image
  source={{ uri: (match.profile as any).photos?.[0]?.downloadURL || (match.profile as any).photos?.[0]?.localUrl }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{match.profile.name}</Text>
          {/* <Text style={styles.time}>{formatTime(match.matchedAt)}</Text> */}
        </View>
        {match.lastMessage ? (
          <Text style={styles.message} numberOfLines={1}>
            {match.lastMessage}
          </Text>
        ) : (
          <Text style={styles.noMessage}>Say hello! 👋</Text>
        )}
      </View>
      {match.unreadCount ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{match.unreadCount}</Text>
        </View>
      ) : (
        <MessageCircle size={20} color={theme.colors.textLight} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  noMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontStyle: "italic",
  },
  unreadBadge: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadCount: {
    color: "white",
    fontSize: theme.fontSize.xs,
    fontWeight: "bold",
  },
});
