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
import { Edit3, Camera, Eye } from "lucide-react-native";
import { useAppNavigation } from "../../../navigation/hooks";
import { useProfileContext } from "../../../context/ProfileContext";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../constants/theme";
import { formatDOB } from "src/utils/dateUtils";

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen(): React.ReactElement {
  const { profile } = useProfileContext();
  const navigation = useAppNavigation();

  const openPreview = (): void => {
    if (!profile) {
      Alert.alert("Profile not ready", "Your profile is still loading.");
      return;
    }
    // ✅ Navigate with the correct union type
    navigation.navigate("Details", { profile });
  };

  const menuItems: MenuItem[] = [
    {
      icon: Edit3,
      label: "Edit",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: Eye,
      label: "Preview",
      onPress: openPreview,
    },
    {
      icon: Camera,
      label: "Photos",
      onPress: () => navigation.navigate("ManagePhotos"),
    },
  ];
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.compactHeader}>
          <View style={styles.compactProfileColumn}>
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
                {profile?.fullName || "User Name, "}
              </Text>
              <Text style={styles.compactAge}>
                {profile?.dateOfBirth ? formatDOB(profile.dateOfBirth) : "21"}
              </Text>
            </View>
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
  statItem: {
    flex: 1,
    alignItems: "center",
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
  compactProfileColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    margin: theme.spacing.sm,
  },
  compactProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
  },
  compactProfileInfo: {
    flexDirection: "row",
    padding: theme.spacing.md,
  },
  compactName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "500",
    color: "white",
  },
  compactAge: {
    fontSize: theme.fontSize.lg,
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: theme.spacing.sm,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
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
    padding: theme.spacing.sm,
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
