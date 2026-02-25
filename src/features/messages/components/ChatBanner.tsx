import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { Image } from "expo-image";
import { useAppNavigation } from "../../../navigation/hooks";
import { formatTime } from "../../../utils/dateUtils"; // Helper for ts
import { IInboxItem } from "../type/chattype";

export const ChatBanner = React.memo(
  ({ item, uid }: { item: IInboxItem; uid: string }) => {
    const navigation = useAppNavigation();

    const handlePress = () => {
      if (!item.otherUser) return;

      navigation.navigate("Chat", {
        roomId: item.roomId,
        uid: uid,
        otherUser: {
          uid: item.otherUser.uid,
          name: item.otherUser.name,
          photo: item.otherUser.photo,
        },
      });
    };

    return (
      <TouchableOpacity
        style={styles.activityCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image
          source={
            item?.otherUser?.photo
              ? { uri: item.otherUser.photo }
              : require("../../../../assets/images/profile.png")
          }
          style={styles.activityImage}
          cachePolicy="disk"
        />
        <View style={styles.activityContent}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {item.otherUser.name}
            </Text>
            <Text style={styles.time}>{formatTime(item.updatedAt)}</Text>
          </View>
          <View style={styles.footer}>
            <Text
              style={[styles.msg, item.unreadCount > 0 && styles.unreadMsgText]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {/* 🔹 THE RED BADGE */}
            {item.unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 9 ? "9+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: theme.spacing.sm,
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
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  msg: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginRight: theme.spacing.md,
  },
  unreadMsg: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  unreadMsgText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: theme.fontSize.sm,
  },
  badgeContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    // Add a subtle shadow for a "high-end" depth effect
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.xs,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});
