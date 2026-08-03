import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTheme } from "@/theme/theme";

interface SubscriptionFooterProps {
  selectedPlanId: string;
  isProcessing: boolean;
  isSubmitDisabled: boolean;
  handlePay: () => void;
}

export const SubscriptionFooter = ({
  selectedPlanId,
  isProcessing,
  isSubmitDisabled,
  handlePay,
}: SubscriptionFooterProps) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // 1. Generate the theme stylesheet directly inside the component execution loop
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.footerContainer,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) },
      ]}
      pointerEvents={isProcessing ? "none" : "auto"}
    >
      <TouchableOpacity
        onPress={handlePay}
        disabled={isSubmitDisabled}
        activeOpacity={0.8}
        style={[
          styles.subscribeButton,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
          !selectedPlanId &&
            !isProcessing && [
              styles.disabledButton,
              { backgroundColor: theme.colors.border },
            ],
          isProcessing && styles.processingButtonState,
        ]}
      >
        {isProcessing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator color="white" size="small" animating={true} />
            <Text style={styles.processingText}>
              {t("subscription.processingPayment")}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.buttonText,
              { color: !selectedPlanId ? theme.colors.textLight : "white" },
            ]}
          >
            {t("subscription.payGoogle")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

/**
 * 2. Theme-aware style sheet definition built directly into the file
 */
const createStyles = (theme: AppTheme) => {
  const isDarkTheme = theme.colors.background === "#0A0A1F";

  return StyleSheet.create({
    footerContainer: {
      position: "absolute",
      bottom: theme.spacing.sm, // Maps to sm token (8px)
      width: "100%",
      paddingHorizontal: theme.spacing.lg, // Maps to lg token (24px)
      paddingTop: theme.spacing.sm, // Maps to sm token (8px)
      backgroundColor: "transparent",
    },
    subscribeButton: {
      height: 56,
      borderRadius: theme.borderRadius.md, // Maps to md token (12px)
      alignItems: "center",
      justifyContent: "center",
      elevation: 8,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDarkTheme ? 0.6 : 0.4, // Boosts overlay depth contrast on dark screens
      shadowRadius: 12,
    },
    disabledButton: {
      elevation: 0,
      shadowOpacity: 0,
    },
    processingButtonState: {
      opacity: 0.9,
    },
    buttonText: {
      fontSize: theme.fontSize.lg, // Maps perfectly to lg token (18px)
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    processingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.md, // Maps to md token (16px)
      width: "100%",
      paddingHorizontal: theme.spacing.md,
    },
    processingText: {
      color: "#FFFFFF",
      flexShrink: 1,
      textAlign: "center",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
};
