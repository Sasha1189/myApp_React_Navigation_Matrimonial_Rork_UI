import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { UserBannerItem } from "../type/chattype";
import { useAuth } from "src/context/AuthContext";
import { LikesReceivedCache } from "../../../cache/cacheConfig";
import { getProfile } from "../../profile/api/profileApi";
import { useAppNavigation } from "../../../navigation/hooks";

interface UserBannerProps {
  item: UserBannerItem;
  type: "sent" | "received";
}

export const UserBanner: React.FC<UserBannerProps> = ({ item, type }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const { user } = useAuth();
  const navigation = useAppNavigation();
  const [isFetching, setIsFetching] = useState(false); // Add local loading state

  const handlePress = async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      // 1. Try Cache (Cost: $0)
      let profile = LikesReceivedCache.getProfileDetail(item.id);

      if (!profile) {
        // 2. Fetch Firestore if not in cache (Cost: 1 Read)
        // Ensure you pass the correct gender and ID
        profile = await getProfile(item.id, user?.displayName || "");

        // 3. Save to cache for next time
        LikesReceivedCache.saveProfileDetail(item.id, profile);
      }

      // 4. Navigate only AFTER data is ready
      navigation.navigate("Details", { profile });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsFetching(false);
    }
  };
  if (!theme) return null;

  return (
    <>
      {/* 1. The Screen Lock Overlay */}
      <Modal visible={isFetching} transparent animationType="none">
        <View style={styles.lockOverlay}>
          {/* Spinner shows in the middle of the screen */}
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Modal>
      {/* 2. The Actual Banner */}
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
            {item?.name || "Username"}
            {/* {formatDOB(item?.age, "age") || "18+"} */}
          </Text>
          <Text style={styles.activityText}>
            {type === "sent"
              ? "You liked this profile ❤️"
              : "They liked you 💌"}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.1)", // Very subtle tint to show it's "thinking"
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    },
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
  });
