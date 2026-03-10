import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Svg, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import {
  Edit3,
  Eye,
  Camera,
  RefreshCw,
  Crown,
  ChevronRight,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";
import { useAppNavigation } from "../../../navigation/hooks";
import { ALL_PROFILE_FIELDS } from "../components/form/profileValidation";
import { formatDOB } from "../../../utils/dateUtils";

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { profile } = useAuth(); // Assuming refreshProfile exists in context
  const navigation = useAppNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate Progress for Circle
  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const filled = ALL_PROFILE_FIELDS.filter((key) => !!profile[key]).length;
    return (filled / ALL_PROFILE_FIELDS.length) * 100;
  }, [profile]);

  const age = profile?.dateOfBirth
    ? formatDOB(profile.dateOfBirth, "age")
    : "21";

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

  const menuItems = [
    {
      icon: Edit3,
      label: "Edit Profile",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: Eye,
      label: "View Preview",
      onPress: () =>
        profile ? navigation.navigate("Details", { profile }) : null,
    },
    {
      icon: Camera,
      label: "Manage Photos",
      onPress: () => navigation.navigate("ManagePhotos"),
    },
  ];

  const size = 110;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (circumference * completionPercent) / 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.imageContainer}>
          {/* Progress Circle */}
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
              profile?.photos?.[0]?.downloadURL
                ? { uri: profile.photos[0].downloadURL }
                : require("../../../../assets/images/profile.png")
            }
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
          {profile?.fullName || "My Name"}, {age}
        </Text>
        <Text style={styles.completionText}>
          {Math.round(completionPercent)}% Profile Completed
        </Text>
      </View>

      {/* 2. Stats Section */}
      <View style={styles.statsRow}>
        {[
          { l: "Matches", v: "42" },
          { l: "Likes Sent", v: "156" },
          { l: "Likes Recv", v: "89" },
        ].map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statVal}>{s.v}</Text>
            <Text style={styles.statLab}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* 3. Menu Section */}
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
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Premium Banner */}
      <TouchableOpacity style={styles.premiumCard}>
        <LinearGradient
          colors={["#6B46C1", "#9F7AEA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumGrad}
        >
          <View style={styles.premiumContent}>
            <View>
              <Text style={styles.premTitle}>Upgrade to Premium</Text>
              <Text style={styles.premSub}>
                See who likes you & Unlimited Swipes
              </Text>
            </View>
            <Crown size={24} color="#FFD700" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerCard: { alignItems: "center", paddingTop: 40, paddingBottom: 20 },
    imageContainer: { width: 110, height: 110, position: "relative" },
    progressSvg: { position: "absolute", top: 0, left: 0 },
    profileImage: { width: 100, height: 100, borderRadius: 50, margin: 5 },
    refreshBtn: {
      position: "absolute",
      bottom: 5,
      right: 5,
      backgroundColor: theme.colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowOpacity: 0.2,
    },
    nameText: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 15,
    },
    completionText: {
      fontSize: 12,
      color: theme.colors.textLight,
      marginTop: 4,
      fontWeight: "500",
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginVertical: 20,
      justifyContent: "space-between",
    },
    statBox: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 15,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      marginHorizontal: 5,
      elevation: 1,
    },
    statVal: { fontSize: 18, fontWeight: "bold", color: theme.colors.primary },
    statLab: {
      fontSize: 11,
      color: theme.colors.textLight,
      marginTop: 4,
      textTransform: "uppercase",
    },
    menuContainer: {
      backgroundColor: theme.colors.card,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 8,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
    },
    menuLeft: { flexDirection: "row", alignItems: "center" },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    menuLabel: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
    premiumCard: {
      margin: 20,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 4,
    },
    premiumGrad: { padding: 20 },
    premiumContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    premTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
    premSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  });
