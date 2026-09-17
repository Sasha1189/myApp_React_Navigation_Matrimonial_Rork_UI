import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

interface AuthFooterActionsProps {
  isLoading: boolean;
  finalButtonDisabled: boolean;
  handleAuthSubmit: () => void;
  insets: { bottom: number; top: number; left: number; right: number };
  buttonText?: string;
  children?: React.ReactNode;
}

export const AuthFooterActions: React.FC<AuthFooterActionsProps> = ({
  isLoading,
  finalButtonDisabled,
  handleAuthSubmit,
  insets,
  buttonText,
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
  });
