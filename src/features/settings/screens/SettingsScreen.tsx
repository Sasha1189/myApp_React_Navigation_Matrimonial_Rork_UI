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
import { useSettingsActions } from "../hooks/useSettingsActions";
import { useBlockedUsers } from "../hooks/useBlockedUsers";
import SettingRow from "../components/SettingRow";
import BlockedUsersModal from "../components/BlockedUsersModal";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { BlockedUserMinimal } from "../../../types/profile";

export default function SettingsScreen() {
  const { mode, toggleTheme } = useAppTheme();
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const isDark = mode === "dark";

  const { openLink, composeWhatsApp, handleLogout } = useSettingsActions();

  const { blockedList, handleUnblock } = useBlockedUsers();

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
          <View style={styles.card}>
            <LanguageSelector />
          </View>

          <Text style={styles.sectionLabel}>{t("settings.appearance")}</Text>
          <View style={styles.card}>
            <SettingRow
              type="toggle"
              icon={Moon}
              title={t("settings.darkMode")}
              subtitle={
                isDark ? t("settings.darkActive") : t("settings.useDark")
              }
              value={isDark}
              onToggle={toggleTheme}
            />
          </View>

          <Text style={styles.sectionLabel}>{t("settings.safety")}</Text>
          <View style={styles.card}>
            <SettingRow
              icon={UserX}
              title={t("settings.blocked")}
              subtitle={t("settings.manageBlocked")}
              onPress={() => setBlockedOpen(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Flag}
              title={t("settings.reportUser")}
              subtitle={t("settings.reportUserDesc")}
              onPress={() => composeWhatsApp("report-user")}
            />
          </View>

          <Text style={styles.sectionLabel}>{t("settings.feedback")}</Text>
          <View style={styles.card}>
            <SettingRow
              icon={Bug}
              title={t("settings.reportBug")}
              subtitle={t("settings.reportBugDesc")}
              onPress={() => composeWhatsApp("bug")}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Star}
              title={t("settings.requestFeature")}
              subtitle={t("settings.requestFeatureDesc")}
              onPress={() => composeWhatsApp("feature")}
            />
          </View>

          <Text style={styles.sectionLabel}>{t("settings.legal")}</Text>
          <View style={styles.card}>
            <SettingRow
              icon={FileText}
              title={t("settings.terms")}
              subtitle={t("settings.termsDesc")}
              onPress={() =>
                openLink("https://sasha1189.github.io/youva-Lonari/", "Terms")
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={FileText}
              title={t("settings.privacy")}
              subtitle={t("settings.privacyDesc")}
              onPress={() =>
                openLink("https://sasha1189.github.io/youva-Lonari/", "Privacy")
              }
            />
          </View>

          <Text style={styles.sectionLabel}>{t("settings.account")}</Text>
          <View style={styles.card}>
            <SettingRow
              type="danger"
              icon={LogOut}
              title={t("settings.logout")}
              subtitle={t("settings.signOutDesc")}
              onPress={handleLogout}
            />
          </View>

          <Text style={styles.versionText}>v1.0.4 (Production)</Text>
        </View>
      </ScrollView>

      <BlockedUsersModal
        visible={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        users={blockedList}
        onUnblock={(user) => {
          handleUnblock(user as BlockedUserMinimal);
        }}
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
