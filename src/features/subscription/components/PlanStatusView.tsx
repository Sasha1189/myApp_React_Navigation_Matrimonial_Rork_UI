import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme"; // Adjust path to your type definition as needed

interface PlanStatusViewProps {
  isLoadingPlans: boolean;
  hasError: boolean;
  refetchPlans: () => void;
}

export const PlanStatusView = ({
  isLoadingPlans,
  hasError,
  refetchPlans,
}: PlanStatusViewProps) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  // Inject the active theme object into the dynamic styles creator
  const styles = createStyles(theme);

  if (isLoadingPlans) {
    return (
      <View style={styles.cardLoaderContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loaderText}>{t("subscription.loadingStore")}</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.cardErrorContainer}>
        <AlertCircle size={24} color={theme.colors.danger} />
        <Text style={styles.errorText}>{t("subscription.loadFailed")}</Text>
        <TouchableOpacity style={styles.inlineRetryBtn} onPress={refetchPlans}>
          <RefreshCw size={12} color={theme.colors.text} />
          <Text style={styles.inlineRetryText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    cardLoaderContainer: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl, // Maps to 24px (close to your original 20px)
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg, // Maps to 24px (close to your original 20px)
    },
    loaderText: {
      fontSize: theme.fontSize.xs, // Maps to 12px (close to your original 13px)
      fontWeight: "500",
      color: theme.colors.textLight,
    },
    cardErrorContainer: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl, // Maps to 24px
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg, // Maps to 24px
      marginBottom: theme.spacing.lg, // Maps to 24px
    },
    errorText: {
      fontSize: theme.fontSize.sm, // Maps to 14px
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.text,
    },
    inlineRetryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    inlineRetryText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.text,
    },
  });
