import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Share2, ShieldAlert } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { AppTheme } from "@/theme/theme";
import { useTranslation } from "react-i18next";

export const ProfileActionFooter = ({ onShare, onBlock, loading }: any) => {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, styles.shareBtn]}
        onPress={onShare}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Share2 size={20} color="white" />
        )}
        <Text style={styles.btnText}>{t("details.actions.share")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.blockBtn]} onPress={onBlock}>
        <ShieldAlert size={20} color={theme.colors.danger} />
        <Text style={[styles.btnText, { color: theme.colors.danger }]}>
          {t("details.actions.block")}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    btn: {
      flex: 1,
      flexDirection: "row",
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    shareBtn: { backgroundColor: theme.colors.primary, marginRight: 8 },
    blockBtn: { borderWidth: 1, borderColor: theme.colors.danger },
    btnText: { fontWeight: "700", color: "white" },
  });
