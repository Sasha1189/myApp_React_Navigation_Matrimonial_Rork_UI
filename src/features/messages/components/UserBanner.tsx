import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { theme } from "../../../constants/theme";
import { UserBannerItem } from "../type/messages";
import { useAppNavigation } from "../../../navigation/hooks";

interface UserBannerProps {
  item: UserBannerItem;
  type: "chats" | "sent" | "received";
}

export const UserBanner: React.FC<UserBannerProps> = ({ item, type }) => {
  const navigation = useAppNavigation();

  const handlePress = () => {
    if (type === "chats") {
      // 🔹 Navigate to chat room using otherUserId
      navigation.navigate("Chat", { otherUserId: item.id });
    } else {
      // 🔹 Navigate to user profile
      if (item.profile) {
        navigation.navigate("Details", { profile: item.profile });
        // navigation.navigate("UserDetails", { profile: item?.profile });
      } else {
        navigation.navigate("Details", { userId: item.id });
      }
    }
  };

  return (
    <TouchableOpacity style={styles.activityCard} onPress={handlePress}>
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require("../../../../assets/images/profile.png")
        }
        style={styles.activityImage}
        contentFit={item.photo ? "cover" : "contain"}
        cachePolicy="disk"
      />
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>
          {item?.name || "Unknown"}, {item?.age || "18+"}
        </Text>
        {type === "chats" ? (
          item.lastMessage ? (
            <Text style={styles.activityText} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          ) : (
            <Text style={styles.activityText}>Say hello! 👋</Text>
          )
        ) : (
          <Text style={styles.activityText}>
            {type === "sent"
              ? "You liked this profile ❤️"
              : "They liked you 💌"}
          </Text>
        )}
      </View>
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

  //////

  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  newMatchesContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  newMatchCard: {
    marginRight: theme.spacing.md,
    alignItems: "center",
  },
  newMatchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.xs,
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  newMatchName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  activityContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
});
