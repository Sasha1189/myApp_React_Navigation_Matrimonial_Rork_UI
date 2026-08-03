import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

interface AuthFooterActionsProps {
  isLoading: boolean;
  finalButtonDisabled: boolean;
  handleAuthSubmit: () => void;
  insets: { bottom: number; top: number; left: number; right: number };
  buttonText?: string; // 🎯 Reusable: Explicit text override (e.g., "Login")
  showCheckbox?: boolean; // 🎯 Reusable: Hide legal blocks on the login screen
  agreeTerms?: boolean;
  setAgreeTerms?: (val: boolean) => void;
  openLink?: (url: string, title: string) => void;
  children?: React.ReactNode; // 🎯 Reusable: Slot for unique layout redirection links
}

export const AuthFooterActions: React.FC<AuthFooterActionsProps> = ({
  isLoading,
  finalButtonDisabled,
  handleAuthSubmit,
  insets,
  buttonText,
  showCheckbox = false,
  agreeTerms = false,
  setAgreeTerms,
  openLink,
  children,
}) => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.footerSection,
        {
          paddingBottom:
            Platform.OS === "android" ? Math.max(insets.bottom, 16) : 16,
        },
      ]}
    >
      {/* ================= CONDITIONALLY RENDER REGISTRATION LEGAL BLOCKS ================= */}
      {showCheckbox && setAgreeTerms && openLink && (
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.8}
            style={[styles.checkboxBox, agreeTerms && styles.checkboxActive]}
          >
            {agreeTerms && <Check size={12} color="white" strokeWidth={3} />}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            {t("auth.agreePrefix")}
            <Text
              style={styles.linkText}
              onPress={() =>
                openLink(
                  "https://sasha1189.github.io/youva-Lonari/terms.html",
                  "Terms",
                )
              }
            >
              {t("auth.termsLinkText")}
            </Text>
            {t("auth.agreeConjunction")}
            <Text
              style={styles.linkText}
              onPress={() =>
                openLink(
                  "https://sasha1189.github.io/youva-Lonari/privacy.html",
                  "Privacy",
                )
              }
            >
              {t("auth.privacyLinkText")}
            </Text>
            {t("auth.agreeSuffix", ".")}
          </Text>
        </View>
      )}

      {/* ================= PRIMARY ACTION SUBMIT BUTTON ================= */}
      <TouchableOpacity
        style={[
          styles.actionSubmitBtn,
          finalButtonDisabled && styles.actionDisabledBtn,
        ]}
        disabled={finalButtonDisabled}
        onPress={handleAuthSubmit}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            style={[
              styles.actionSubmitText,
              finalButtonDisabled && styles.actionDisabledText,
            ]}
          >
            {buttonText || t("auth.submitRegister", "Sign Up")}
          </Text>
        )}
      </TouchableOpacity>

      {/* ================= CUSTOM CARD LINK REDIRECTION ELEMENT SLOT ================= */}
      {children}
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footerSection: {
      justifyContent: "flex-end",
      width: "100%",
      backgroundColor: theme.colors.card,
      marginTop: theme.spacing.lg,
    },
    actionSubmitBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center",
      width: "100%",
    },
    actionSubmitText: {
      color: "white",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    actionDisabledBtn: { backgroundColor: theme.colors.border },
    actionDisabledText: { color: theme.colors.textLight },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      paddingRight: theme.spacing.md,
    },
    checkboxBox: {
      width: 18,
      height: 18,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center",
      // justifycontent: "center",
    },
    checkboxActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      lineHeight: 18,
      fontWeight: "500",
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    linkText: { color: theme.colors.accent || "#1c7ed6", fontWeight: "600" },
  });
