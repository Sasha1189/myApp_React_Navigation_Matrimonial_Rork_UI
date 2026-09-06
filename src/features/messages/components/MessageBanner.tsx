import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { Image } from "expo-image";
import { useAppNavigation } from "../../../navigation/hooks";
import { formatTime } from "../../../utils/dateUtils"; // Helper for ts
import { IInboxItem } from "../type/chattype";
import { resolvePhotoUri } from "@/utils/photoUtils";

export const MessageBanner = React.memo(
  ({ item, uid }: { item: IInboxItem; uid: string }) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);
    const navigation = useAppNavigation();

    if (!theme) return null;

    const otherUid = item.ou?.uid;
    const photo = item.ou?.photo;
    const name = item.ou?.name ?? "";

    const imageUri = resolvePhotoUri(photo ?? undefined, otherUid) || "";

    //....
    const handlePress = () => {
      if (!item.ou) return;
      navigation.navigate("Chat", {
        rId: item.rId,
        uid: uid,
        ou: {
          uid: item.ou.uid,
          name: name,
          photo: imageUri,
        },
      });
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.6}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            placeholder={require("../../../../assets/images/profile.webp")}
            style={styles.activityImage}
            contentFit="cover"
            cachePolicy="disk"
          />
        </View>

        <View style={styles.activityContent}>
          <View style={styles.header}>
            <Text
              style={[styles.name, item.u && styles.unreadName]}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text style={[styles.time, item.u && styles.unreadTime]}>
              {formatTime(item.ua)}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.msg, item?.u && styles.unreadMsgText]}
              numberOfLines={1}
            >
              {item.lm}
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
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.sm,
      paddingRight: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderBottomWidth: 0.5,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xs,
    },
    imageWrapper: {
      position: "relative",
    },
    activityImage: {
      width: 38,
      height: 38,
      borderRadius: 19,
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
      fontSize: theme.fontSize.sm,
      fontWeight: "500", // Standard weight
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    unreadName: {
      fontWeight: "600", // Bold only when unread
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
      fontSize: theme.fontSize.xs,
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
