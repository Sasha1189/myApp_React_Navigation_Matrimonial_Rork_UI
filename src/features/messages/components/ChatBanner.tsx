import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image
          source={
            item?.otherUser?.photo
              ? { uri: item.otherUser.photo }
              : require("../../../../assets/images/profile.png")
          }
          style={styles.avatar}
          cachePolicy="disk"
        />
        <View style={styles.content}>
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
  container: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    marginLeft: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  time: { fontSize: 12, color: "#888" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  msg: { fontSize: 14, color: "#666", flex: 1, marginRight: 10 },
  unreadMsg: { color: "#000", fontWeight: "600" },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadMsgText: {
    color: "#000",
    fontWeight: "700", // Make text bold if unread
  },
  badgeContainer: {
    backgroundColor: "#FF3B30", // WhatsApp Red
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
