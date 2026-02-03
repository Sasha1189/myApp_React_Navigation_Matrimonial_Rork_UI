import { theme } from "../../../theme/index";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  Moon,
  UserX,
  Flag,
  Star,
  FileText,
  Bug,
  LogOut,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BlockedUsersModal from "../components/BlockedUsersModal";
import { useBlockUnblockUser } from "../hooks/useBlockUnblockUser";
import { useProfileContext } from "../../../context/ProfileContext";
import { useBlockedUserDetails } from "../hooks/useBlockedUserDetails";

import { getAuth, signOut } from "@react-native-firebase/auth";
import { useAuth } from "src/context/AuthContext";
import { clearCacheOnLogout, storage } from "src/cache/cacheConfig";

export default function SettingsScreen() {
  const { setUser } = useAuth();
  const { profile } = useProfileContext();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    hideProfile: false,
  });
  // theme related
  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // block/unblock related
  const { unblockUser, isReady } = useBlockUnblockUser(
    profile?.uid ?? "",
    profile?.gender ?? "",
  );

  const { data: blockedUsers = [] } = useBlockedUserDetails(profile?.uid);

  const handleUnblock = (uid: string) => {
    if (!isReady) return;
    unblockUser(uid);
  };

  // modal visibility related
  const [blockedOpen, setBlockedOpen] = useState(false);
  const onBlockedUsers = () => setBlockedOpen(true);

  // whatsup related
  const openLink = async (url: string, label: string) => {
    try {
      await Linking.openURL(url); // no canOpenURL check
    } catch (e) {
      Alert.alert("Error", `Couldn't open ${label}.`);
    }
  };
  const WHATSAPP_NUMBER = "919921794390";

  const composeWhatsApp = async (type: "bug" | "feature" | "report-user") => {
    const heading =
      type === "bug"
        ? "Bug report — Lonari Youva Connect"
        : type === "feature"
          ? "Feature request — Lonari Youva Connect"
          : "Report user — Lonari Youva Connect";

    const preset =
      type === "bug"
        ? "Issue:\nSteps to reproduce:\nExpected vs actual:\nDevice/Version:"
        : type === "feature"
          ? "Feature idea:\nWhy it's useful:\nAny examples:"
          : "Report user details:\nWhich user you want to report?\nReason:\nAny screenshot / evidence:";

    const text = encodeURIComponent(`${heading}\n\n${preset}`);
    const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`;
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    try {
      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert(
          "WhatsApp not available",
          "Couldn't open WhatsApp. Please check your installation or try again later.",
        );
      }
    }
  };
  const onReportUser = () => composeWhatsApp("report-user");
  const onReportBug = () => composeWhatsApp("bug");
  const onFeatureRequest = () => composeWhatsApp("feature");
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
              const auth = getAuth();
              await signOut(auth);

              await clearCacheOnLogout();

              setUser(null);
            } catch (error: any) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.primary + "20", "transparent"]}
          // style={styles.headerGradient}
        />
        <View style={styles.content}>
          {/* Appearance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.sectionContent}>
              {/* Dark Mode (toggle) */}
              <TouchableOpacity style={styles.settingItem} activeOpacity={1}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Moon size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Dark Mode</Text>
                    <Text style={styles.settingSubtitle}>Use dark theme</Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <Switch
                    value={settings.darkMode}
                    onValueChange={(value) => updateSetting("darkMode", value)}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primary + "40",
                    }}
                    thumbColor={
                      settings.darkMode
                        ? theme.colors.primary
                        : theme.colors.textLight
                    }
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Tools</Text>
            <View style={styles.sectionContent}>
              {/* Blocked Users */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={onBlockedUsers}
                disabled={!isReady}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <UserX size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Blocked Users</Text>
                    <Text style={styles.settingSubtitle}>
                      Manage users you have blocked
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>

              {/* Report a User */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={onReportUser}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Flag size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Report a User</Text>
                    <Text style={styles.settingSubtitle}>
                      Report inappropriate behavior
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <View style={styles.sectionContent}>
              {/* Report a Bug */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={onReportBug}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Bug size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Report a Bug</Text>
                    <Text style={styles.settingSubtitle}>
                      Opens WhatsApp message to report a bug
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>

              {/* Request a Feature */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={onFeatureRequest}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Star size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Request a Feature</Text>
                    <Text style={styles.settingSubtitle}>
                      Opens WhatsApp message to request a feature
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal & Policies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal & Policies</Text>
            <View style={styles.sectionContent}>
              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() =>
                  openLink(
                    "https://sasha1189.github.io/youva-Lonari/terms.html",
                    "Terms & Conditions",
                  )
                }
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <FileText size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Terms & Conditions</Text>
                    <Text style={styles.settingSubtitle}>
                      Read our terms of service
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>

              {/* Privacy Policy */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() =>
                  openLink(
                    "https://sasha1189.github.io/youva-Lonari/privacy.html",
                    "Privacy Policy",
                  )
                }
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <FileText size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Privacy Policy</Text>
                    <Text style={styles.settingSubtitle}>
                      Learn how we protect your data
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* LogOut */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LogOut</Text>
            <View style={styles.sectionContent}>
              {/* LogOut */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => logout()}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <LogOut size={20} color={theme.colors.danger} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>LogOut</Text>
                    <Text style={styles.settingSubtitle}>
                      LogOut from your account
                    </Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <ChevronRight size={20} color={theme.colors.danger} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <BlockedUsersModal
        visible={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        users={blockedUsers}
        onUnblock={handleUnblock}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    // padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: theme.spacing.md,
  },
});
