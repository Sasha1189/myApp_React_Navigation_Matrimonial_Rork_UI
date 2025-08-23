import React from "react";
import { useAppNavigation } from "../../../navigation/hooks";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useProfileContext } from "../../../context/ProfileContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Edit3,
  Camera,
  Shield,
  HelpCircle,
  LogOut,
  Eye,
} from "lucide-react-native";
import { theme } from "../../../constants/theme";

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const { profile } = useProfileContext();

  const getAge = (dob: any) => {
    if (!dob) return "-";
    const d =
      typeof dob === "string"
        ? new Date(dob)
        : dob instanceof Date
        ? dob
        : new Date(dob);
    if (isNaN(d.getTime())) return "-";
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const displayName =
    (profile && (profile.fullName || (profile as any).full_name)) || "John Doe";
  const displayAge = profile
    ? getAge((profile as any).dateOfBirth || (profile as any).dob)
    : "-";
  const imageUri =
    (profile &&
      ((profile as any).profileImages?.[0] ||
        (profile as any).avatar ||
        (profile as any).photoUrl)) ||
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400";

  const logout = async () => {
    try {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            await signOut(auth);
            console.log("User signed out");
          },
        },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const openPreview = () => {
    const uid = (profile as any)?.id || (profile as any)?.uid;
    if (!uid) {
      Alert.alert("Profile not ready", "Your profile is still loading.");
      return;
    }
    (navigation as any).navigate("UserDetails", {
      userId: uid,
      cachedProfile: profile,
    });
  };

  const menuItems = [
    {
      icon: Edit3,
      label: "Edit Profile",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: Eye,
      label: "Preview Profile",
      onPress: openPreview,
    },
    {
      icon: Camera,
      label: "Manage Photos",
      onPress: () => navigation.navigate("ManagePhotos"),
    },
    {
      icon: Settings,
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: Shield,
      label: "Safety & Privacy",
      onPress: () => navigation.navigate("SafetyPrivacy"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onPress: () => navigation.navigate("HelpSupport"),
    },
  ];
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.compactHeader}>
          <View style={styles.compactProfileRow}>
            <Image
              source={{ uri: imageUri }}
              style={styles.compactProfileImage}
            />
            <View style={styles.compactProfileInfo}>
              <Text style={styles.compactName}>{displayName}</Text>
              <Text style={styles.compactAge}>{displayAge} yrs</Text>
            </View>
            <TouchableOpacity
              style={styles.headerLogout}
              onPress={() => logout()}
            >
              <LogOut size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainerCompact}>
            <View style={styles.statItem}>
              <Text style={styles.statValueCompact}>42</Text>
              <Text style={styles.statLabelCompact}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValueCompact}>156</Text>
              <Text style={styles.statLabelCompact}>Likes Sent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValueCompact}>89</Text>
              <Text style={styles.statLabelCompact}>Likes Received</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} onPress={item.onPress}>
              <View style={styles.menuCard}>
                <item.icon
                  size={20}
                  color={
                    (item as any).danger
                      ? theme.colors.danger
                      : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.menuItemText,
                    (item as any).danger && styles.menuItemTextDanger,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.premiumBanner}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            style={styles.premiumGradient}
          />
          <Text style={styles.premiumTitle}>Get Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Unlimited likes, see who likes you, and more!
          </Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: "white",
    marginBottom: theme.spacing.xs,
  },
  profileAge: {
    fontSize: theme.fontSize.md,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: "white",
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: theme.spacing.md,
  },
  compactHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  compactProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  compactProfileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "white",
  },
  compactProfileInfo: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  compactName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: "white",
  },
  compactAge: {
    fontSize: theme.fontSize.xs,
    color: "rgba(255,255,255,0.85)",
  },
  statsContainerCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  statValueCompact: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "white",
  },
  statLabelCompact: {
    fontSize: theme.fontSize.xs,
    color: "rgba(255,255,255,0.85)",
  },
  menuSection: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerLogout: {
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  menuItemTextDanger: {
    color: theme.colors.danger,
  },
  premiumBanner: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  premiumGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  premiumTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  premiumSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  premiumButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
  },
  premiumButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    color: theme.colors.text,
  },
});
