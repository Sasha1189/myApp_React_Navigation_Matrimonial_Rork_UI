import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import {
  Edit3,
  Eye,
  Camera,
  RefreshCw,
  Crown,
  ChevronRight,
} from "lucide-react-native";
import { ALL_PROFILE_FIELDS } from "../components/form/profileValidation";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";
import { formatDOB } from "../../../utils/dateUtils";
import { useTranslation } from "react-i18next";
import { useProfileStats } from "../hooks/useProfileStats";

export default function ProfileScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user, myProfile } = useAuth();
  const { t } = useTranslation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimized sizes for "No-Scroll" feel
  const size = 85;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (circumference * 75) / 100; // Example 75%

  const menuItems = [
    {
      icon: Edit3,
      label: t("profile.editProfile"),
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: Eye,
      label: t("profile.viewPreview"),
      onPress: () =>
        myProfile
          ? navigation.navigate("Details", { profile: myProfile })
          : null,
    },
    {
      icon: Camera,
      label: t("profile.managePhotos"),
      onPress: () => navigation.navigate("ManagePhotos"),
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // await refreshProfile?.();
    } catch (e) {
      Alert.alert("Error", "Could not refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  const { matchesCount, sentCount, receivedCount, isLoading } = useProfileStats(
    user?.uid,
  );

  // Calculate Progress for Circle
  const completionPercent = useMemo(() => {
    if (!myProfile) return 0;
    const filled = ALL_PROFILE_FIELDS.filter((key) => !!myProfile[key]).length;
    return (filled / ALL_PROFILE_FIELDS.length) * 100;
  }, [myProfile]);

  const age = myProfile?.dateOfBirth
    ? formatDOB(myProfile.dateOfBirth, "age")
    : "18";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. SLIM HEADER */}
      <View style={styles.headerCard}>
        <View style={styles.imageContainer}>
          <Svg width={size} height={size} style={styles.progressSvg}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.border}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <Image
            source={
              myProfile?.photos?.[0]?.downloadURL
                ? { uri: myProfile.photos[0].downloadURL }
                : myProfile?.photos?.[0]?.localUrl
                  ? { uri: myProfile.photos[0].localUrl }
                  : require("../../../../assets/images/profile.webp")
            }
            placeholder={require("../../../../assets/images/profile.webp")}
            placeholderContentFit="cover"
            style={styles.profileImage}
            contentFit="cover"
            cachePolicy="disk"
          />
          {/* Refresh Button at 45 Degrees */}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <RefreshCw size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.nameText}>
          {myProfile?.fullName || "My Name"}, {age}
        </Text>
        <Text style={styles.completionText}>
          {t("profile.completion", { percent: Math.round(completionPercent) })}
        </Text>
      </View>

      {/* 2. CONDENSED STATS BAR */}
      <View style={styles.statsBar}>
        {[
          {
            l: t("profile.stats.sent"),
            v: isLoading ? "—" : sentCount,
            requiredTier: "BASIC",
          },
          {
            l: t("profile.stats.received"),
            v: isLoading ? "—" : receivedCount,
            requiredTier: "PREMIUM",
          },
          {
            l: t("profile.stats.matches"),
            v: isLoading ? "—" : matchesCount,
            requiredTier: "PREMIUM",
          },
        ].map((s, i) => {
          const isLocked = s.v === "Upgrade to see";
          return (
            <React.Fragment key={i}>
              <View style={styles.statItem}>
                {isLocked ? (
                  // Pure text-based layout wrapper block (No routing / No buttons)
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.4)",
                        textTransform: "lowercase",
                        lineHeight: 6,
                      }}
                    >
                      {t("profile.stats.upgradeTo", {
                        defaultValue: "Upgrade to",
                      })}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "900",
                        letterSpacing: 0.5,
                        lineHeight: 11,
                        color:
                          s.requiredTier === "PREMIUM" ? "#FFD700" : "#3B82F6", // Gold for Premium, Blue for Basic
                      }}
                    >
                      {s.requiredTier}
                    </Text>
                  </View>
                ) : (
                  // Renders authorized numeric text metrics cleanly
                  <Text
                    style={
                      styles.nameText
                        ? styles.statVal
                        : { fontSize: 18, fontWeight: "700" }
                    }
                  >
                    {s.v}
                  </Text>
                )}
                <Text style={styles.statLab}>{s.l}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* 3. MENU SECTION */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <item.icon size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. PREMIUM BANNER */}
      <TouchableOpacity
        style={styles.premiumCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Paywall")}
      >
        <LinearGradient
          colors={["#0A192F", "#1E3A8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumGrad}
        >
          <View style={styles.premiumContent}>
            <View>
              <Text style={styles.premTitle}>
                {t("profile.premium.upgrade")}
              </Text>
              <Text style={styles.premSub}>
                {t("profile.premium.benefits")}
              </Text>
            </View>
            <View style={styles.crownCircle}>
              <Crown size={20} color="#FFD700" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
      marginRight: theme.spacing.md,
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
      fontSize: theme.fontSize.sm,
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
      justifyContent: "space-between",
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
