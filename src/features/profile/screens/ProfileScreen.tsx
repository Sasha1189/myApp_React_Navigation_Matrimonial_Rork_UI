import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "../context/ProfileContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";
import { useTranslation } from "react-i18next";
import { useProfileStats } from "../hooks/useProfileStats";
import { SlimHeader } from "../components/profileScreen/SlimHeader";
import { StatsBar } from "../components/profileScreen/StatsBar";
import { MenuSection } from "../components/profileScreen/MenuSection";
import { PremiumBanner } from "../components/profileScreen/PremiumBanner";
import { useProfileCompletion } from "../hooks/useProfileCompletion";

export default function ProfileScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user } = useAuth();
  const { myProfile } = useMyProfile();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. ADDED HERE: Derived hook utilities inside the parent layout
  const completionPercent = useProfileCompletion(myProfile);
  const { matchesCount, sentCount, receivedCount, isLoading } = useProfileStats(
    user?.uid,
  );

  // 3. ADDED HERE: Refresh interaction handler function (Fixed syntax error)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // await refreshProfile?.();
    } catch (e) {
      Alert.alert("Error", "Could not refresh profile");
    } finally {
      // Fixed typo: changed 'compression' back to standard native 'finally'
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <SlimHeader
          profile={myProfile}
          completionPercent={completionPercent}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          theme={theme}
          styles={styles}
        />

        <StatsBar
          isLoading={isLoading}
          sentCount={sentCount}
          receivedCount={receivedCount}
          matchesCount={matchesCount}
          styles={styles}
        />

        <MenuSection
          myProfile={myProfile}
          navigation={navigation}
          t={t}
          styles={styles}
        />

        <PremiumBanner
          onPress={() => navigation.navigate("Paywall")}
          styles={styles}
        />
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16 },
    scrollContent: { paddingBottom: 60 },
    headerCard: { alignItems: "center" },
    imageContainer: { width: 85, height: 85, position: "relative" },
    progressSvg: { position: "absolute", top: 0, left: 0 },
    profileImage: { width: 77, height: 77, borderRadius: 38.5, margin: 4 },
    refreshBtn: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
    },
    // SOFT TYPOGRAPHY
    nameText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 10,
      letterSpacing: 0.3,
      opacity: 0.9,
    },
    completionText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      opacity: 0.6,
      marginTop: 2,
      letterSpacing: 0.3,
    },

    // CONDENSED STATS BAR
    statsBar: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      marginVertical: 20,
      borderRadius: 15,
      paddingVertical: 8,
      alignItems: "center",
      elevation: 1,
    },
    statItem: { flex: 1, alignItems: "center" },
    statVal: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.primary,
      letterSpacing: 0.3,
    },
    statLab: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      opacity: 0.5,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    statDivider: { width: 1, height: 20, backgroundColor: theme.colors.border },
    menuContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    premiumCard: {
      marginTop: 20,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 4,
    },
    premiumGrad: { padding: 18 },
    premiumContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    premTitle: {
      fontSize: theme.fontSize.sm,
      color: "#FFFFFF",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    premSub: {
      color: "rgba(255,255,255,0.85)",
      fontSize: theme.fontSize.xs,
      marginTop: 2,
      letterSpacing: 0.3,
    },
    crownCircle: {
      width: 38,
      height: 38,
      borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
