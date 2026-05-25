import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Heart, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { UserBannerItem } from "../type/chattype";
import { useAuth } from "src/context/AuthContext";
import { LikesReceivedCache } from "../../../cache/cacheConfig";
import { getProfile } from "../../profile/api/profileApi";
import { useAppNavigation } from "../../../navigation/hooks";
import { useTranslation } from "react-i18next";

interface UserBannerProps {
  item: UserBannerItem;
  type: "sent" | "received";
}

export const UserBanner: React.FC<UserBannerProps> = ({ item, type }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [isFetching, setIsFetching] = useState(false);

  const handlePress = async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      let profile = LikesReceivedCache.getProfileDetail(item.id);
      if (!profile) {
        profile = await getProfile(item.id, user?.displayName || "");
        LikesReceivedCache.saveProfileDetail(item.id, profile);
      }
      navigation.navigate("Details", { profile });
    } catch (error) {
      console.error("Profile load failed:", error);
    } finally {
      setIsFetching(false);
    }
  };

  if (!theme) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.6}
      disabled={isFetching}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={
            item.photo
              ? { uri: item.photo }
              : require("../../../../assets/images/profile.webp")
          }
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
        />
        {isFetching && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.name || t("chat.status.defaultUser")}
          </Text>
          <ChevronRight size={16} color={theme.colors.border} />
        </View>

        <View style={styles.statusRow}>
          <Heart
            size={12}
            color={
              type === "sent" ? theme.colors.textLight : theme.colors.primary
            }
            fill={type === "received" ? theme.colors.primary : "transparent"}
          />
          <Text style={styles.statusText}>
            {type === "sent"
              ? t("chat.status.sent")
              : t("chat.status.received")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    imageWrapper: {
      position: "relative",
    },
    image: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    imageLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.7)",
      borderRadius: 26,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    name: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      fontWeight: "500",
    },
  });
