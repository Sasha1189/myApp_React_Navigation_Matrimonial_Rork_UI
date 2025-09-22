import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import {
  Settings,
  Edit3,
  Camera,
  Shield,
  HelpCircle,
  LogOut,
  Eye,
} from "lucide-react-native";
import { useAppNavigation } from "../../../navigation/hooks";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useProfileContext } from "../../../context/ProfileContext";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../constants/theme";
import { useAuth } from "src/context/AuthContext";
import { storage } from "../../../utils/storage";
import { formatDOB } from "src/utils/dateUtils";

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen(): React.ReactElement {
  const { setUser } = useAuth();
  const { profile } = useProfileContext();
  const navigation = useAppNavigation();

  const logout = async (): Promise<void> => {
    try {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            try {
              await signOut(auth);
              console.log("User signed out");
            } catch (signOutError) {
              console.error("Sign out failed:", signOutError);
            } finally {
              try {
                // clear any cached user data
                await storage.clear();
                console.log("AsyncStorage cleared");
              } catch (storageError) {
                console.error("Failed to clear storage:", storageError);
              }
              // reset auth context
              if (typeof setUser === "function") {
                // cast to any to avoid coupling to concrete user type
                setUser(null as any);
              }
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openPreview = (): void => {
    if (!profile) {
      Alert.alert("Profile not ready", "Your profile is still loading.");
      return;
    }
    // ✅ Navigate with the correct union type
    navigation.navigate("UserDetails", { profile });
  };

  const menuItems: MenuItem[] = [
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
              source={
                profile?.photos?.[0]?.downloadURL
                  ? { uri: profile.photos[0].downloadURL }
                  : require("../../../../assets/images/profile.png")
              }
              style={styles.compactProfileImage}
              contentFit={
                profile?.photos?.[0]?.downloadURL ? "cover" : "contain"
              }
              cachePolicy="disk"
            />
            <View style={styles.compactProfileInfo}>
              <Text style={styles.compactName}>
                {profile?.fullName || "New user"}
              </Text>
              <Text style={styles.compactAge}>
                {profile?.dateOfBirth
                  ? formatDOB(profile.dateOfBirth, "age")
                  : "-- age"}
              </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
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
