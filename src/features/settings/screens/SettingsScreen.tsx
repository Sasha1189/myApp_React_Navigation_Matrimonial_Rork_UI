import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import {
  Moon,
  UserX,
  Flag,
  Star,
  FileText,
  Bug,
  LogOut,
} from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { useAuth } from "@/context/AuthContext";
import { useSettingsActions } from "../hooks/useSettingsActions";
import { useBlockUnblockUser } from "../hooks/useBlockUnblockUser";
import { useBlockedUserDetails } from "../hooks/useBlockedUserDetails";
import SettingRow from "../components/SettingRow";
import BlockedUsersModal from "../components/BlockedUsersModal";

export default function SettingsScreen() {
  const { profile } = useAuth();
  const { theme, mode, toggleTheme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const isDark = mode === "dark";

  const { openLink, composeWhatsApp, handleLogout } = useSettingsActions();
  const { unblockUser, isReady } = useBlockUnblockUser(
    profile?.uid ?? "",
    profile?.gender ?? "",
  );
  const { data: blockedUsers = [] } = useBlockedUserDetails(profile?.uid);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.card}>
            <SettingRow
              type="toggle"
              icon={Moon}
              title="Dark Mode"
              subtitle={isDark ? "Dark theme active" : "Use dark theme"}
              value={isDark}
              onToggle={toggleTheme}
            />
          </View>

          <Text style={styles.sectionLabel}>Safety & Support</Text>
          <View style={styles.card}>
            <SettingRow
              icon={UserX}
              title="Blocked Users"
              subtitle="Manage users you blocked"
              onPress={() => setBlockedOpen(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Flag}
              title="Report a User"
              subtitle="Report inappropriate behavior"
              onPress={() => composeWhatsApp("report-user")}
            />
          </View>

          <Text style={styles.sectionLabel}>Feedback</Text>
          <View style={styles.card}>
            <SettingRow
              icon={Bug}
              title="Report a Bug"
              subtitle="Tell us about a technical issue"
              onPress={() => composeWhatsApp("bug")}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Star}
              title="Request a Feature"
              subtitle="Suggest new ideas"
              onPress={() => composeWhatsApp("feature")}
            />
          </View>

          <Text style={styles.sectionLabel}>Legal</Text>
          <View style={styles.card}>
            <SettingRow
              icon={FileText}
              title="Terms & Conditions"
              subtitle="View our service terms"
              onPress={() => openLink("https://sasha1189.github.io", "Terms")}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={FileText}
              title="Privacy Policy"
              subtitle="How we handle your data"
              onPress={() => openLink("https://sasha1189.github.io", "Privacy")}
            />
          </View>

          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <SettingRow
              type="danger"
              icon={LogOut}
              title="Log Out"
              subtitle="Sign out securely"
              onPress={handleLogout}
            />
          </View>

          <Text style={styles.versionText}>v1.0.4 (Production)</Text>
        </View>
      </ScrollView>

      <BlockedUsersModal
        visible={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        users={blockedUsers}
        onUnblock={unblockUser}
      />
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, paddingTop: 10 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginLeft: 8,
      marginBottom: 8,
      marginTop: 16,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: 68,
    },
    versionText: {
      textAlign: "center",
      color: theme.colors.textLight,
      fontSize: 12,
      marginTop: 20,
      marginBottom: 40,
    },
  });
