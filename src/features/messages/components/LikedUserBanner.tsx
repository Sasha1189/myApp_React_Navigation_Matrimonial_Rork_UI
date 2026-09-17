import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heart, ChevronRight, Lock } from "lucide-react-native";
import { Image } from "expo-image";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAppNavigation } from "../../../navigation/hooks";
import { useTranslation } from "react-i18next";
import { Profile } from "@/features/profile/types/profile";
import { resolveThumbUri } from "@/utils/photoUtils";
import { useProfileStats } from "@/features/profile/hooks/useProfileStats";
import { useAuth } from "@/context/AuthContext";

interface UserBannerProps {
  item: Profile;
  type: "sent" | "received";
}

export const LikedUserBanner: React.FC<UserBannerProps> = ({ item, type }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { user, tier } = useAuth();

  if (!user?.uid) return;

  const { receivedCount } = useProfileStats(user.uid);
  const count = receivedCount || 0;

  const isSubscribed = tier === "premium";

  const handlePress = () => {
    navigation.navigate("Details", { profile: item });
  };

  const handleUpgradePress = () => {
    navigation.navigate("Paywall");
  };

  const uid = item?.uid;
  const photo = item?.tn;

  const imageUri = resolveThumbUri(photo, uid) || "";

  // Handle Non-Premium Received Likes Banner
  if (!isSubscribed && type === "received") {
    let message = t("chat.likeBanner.bannerZero");
    if (count === 1) {
      message = t("chat.likeBanner.bannerOne");
    } else if (count > 1) {
      message = t("chat.likeBanner.bannerOther", { count });
    }
    return (
      <TouchableOpacity
        style={[styles.card, styles.premiumBannerCard]}
        onPress={handleUpgradePress}
        activeOpacity={0.7}
      >
        <View style={styles.premiumIconWrapper}>
          <Heart
            size={20}
            color={theme.colors.primary}
            fill={theme.colors.primary}
          />
          <View style={styles.lockBadge}>
            <Lock size={8} color="#FFF" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.premiumMessageText}>{message}</Text>
        </View>

        <ChevronRight size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    );
  }

  if (!theme) return null;

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
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.fn || t("chat.status.defaultUser")}
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
    premiumBannerCard: {
      backgroundColor: `${theme.colors.primary}0D`,
      borderColor: `${theme.colors.primary}33`,
      borderWidth: 1,
    },
    premiumIconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: `${theme.colors.primary}1A`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
      position: "relative",
    },
    lockBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
      padding: 2,
    },
    premiumMessageText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.text,
      fontWeight: "500",
      lineHeight: 16,
    },
    imageWrapper: {
      position: "relative",
    },
    image: {
      width: 38,
      height: 38,
      borderRadius: 19,
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
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      fontWeight: "400",
    },
  });
