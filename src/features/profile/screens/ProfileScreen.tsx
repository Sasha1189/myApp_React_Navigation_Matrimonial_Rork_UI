import React, { useState } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
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
      {/* Passing handlers down cleanly as standard element properties */}
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
        theme={theme}
        styles={styles}
      />

      <PremiumBanner
        onPress={() => navigation.navigate("Paywall")}
        styles={styles}
      />
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 30 },
    headerCard: { alignItems: "center", paddingTop: 25, paddingBottom: 15 },
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
      fontSize: 19,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 10,
      letterSpacing: 0.5,
      opacity: 0.9,
    },
    completionText: {
      fontSize: 11,
      color: theme.colors.text,
      opacity: 0.6,
      marginTop: 2,
      fontWeight: "500",
      letterSpacing: 0.3,
    },

    // CONDENSED STATS BAR
    statsBar: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      marginHorizontal: 20,
      marginVertical: 15,
      borderRadius: 15,
      paddingVertical: 12,
      alignItems: "center",
      elevation: 1,
    },
    statItem: { flex: 1, alignItems: "center" },
    statVal: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    statLab: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.5,
      marginTop: 2,
      textTransform: "uppercase",
      fontWeight: "700",
      letterSpacing: 0.8,
    },
    statDivider: { width: 1, height: 20, backgroundColor: theme.colors.border },
    menuContainer: {
      backgroundColor: theme.colors.card,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 4,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginRight: theme.spacing.xl,
      padding: 10,
    },
    menuLeft: { flexDirection: "row", alignItems: "center" },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
      justifyContent: "center",
    },
    menuLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.5,
      opacity: 0.8,
    },
    premiumCard: {
      marginHorizontal: 20,
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
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    premSub: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 11,
      marginTop: 2,
      letterSpacing: 0.2,
    },
    crownCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
