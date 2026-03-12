import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Image } from "expo-image";
import { useAppNavigation } from "../../../navigation/hooks";
import { formatTime } from "../../../utils/dateUtils"; // Helper for ts
import { IInboxItem } from "../type/chattype";

export const ChatBanner = React.memo(
  ({ item, uid }: { item: IInboxItem; uid: string }) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);
    const navigation = useAppNavigation();

    if (!theme) return null;

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
        style={styles.activityCard} // Removed unreadCard from here for a cleaner look
        onPress={handlePress}
        activeOpacity={0.6}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={
              item?.otherUser?.photo
                ? { uri: item.otherUser.photo }
                : require("../../../../assets/images/profile.png")
            }
            style={styles.activityImage}
            contentFit="cover"
            cachePolicy="disk"
          />
          {/* Subtle Online/Status indicator could go here later */}
        </View>

        <View style={styles.activityContent}>
          <View style={styles.header}>
            <Text
              style={[styles.name, item.u && styles.unreadName]}
              numberOfLines={1}
            >
              {item.otherUser.name}
            </Text>
            <Text style={[styles.time, item.u && styles.unreadTime]}>
              {formatTime(item.updatedAt)}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.msg, item?.u && styles.unreadMsgText]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {item.u && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    activityCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border, // Border instead of shadow for RHF look
    },
    imageWrapper: {
      position: "relative",
    },
    activityImage: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activityContent: {
      flex: 1,
      justifyContent: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    name: {
      fontSize: theme.fontSize.md,
      fontWeight: "500", // Standard weight
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    unreadName: {
      fontWeight: "700", // Bold only when unread
    },
    time: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      fontWeight: "400",
    },
    unreadTime: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    msg: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      lineHeight: 20,
    },
    unreadMsgText: {
      color: theme.colors.text, // Darker text for unread
      fontWeight: "600",
    },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
  });
