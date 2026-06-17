import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Crown } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { useSubscription } from "../hooks/useSubscription";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { AppBenefitsList } from "../components/AppBenefitsList"; // 🌟 Our new separate benefits module
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTheme } from "@/theme/theme";

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

  const {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans,
  } = useSubscription();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Crown size={40} color={theme.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t("subscription.upgradeTitle")}</Text>
              <Text style={styles.subtitle}>
                {t("subscription.upgradeSubtitle")}
              </Text>
            </View>
          </View>

          {/* Section Indicator */}
          <Text style={styles.sectionLabel}>
            {t("subscription.choosePlan", "Choose a Plan")}
          </Text>

          {/* Plan Card 1 */}
          <SubscriptionCard
            planId="basic"
            skuId="basic_membership_1y"
            fallbackPrice="₹699/-"
            availablePlans={availablePlans}
            isSelected={selectedPlanId === "basic"}
            onSelect={() => setSelectedPlanId("basic")}
          />

          {/* Plan Card 2 */}
          <SubscriptionCard
            planId="premium"
            skuId="premium_membership_1y"
            fallbackPrice="₹1699/-"
            availablePlans={availablePlans}
            isSelected={selectedPlanId === "premium"}
            onSelect={() => setSelectedPlanId("premium")}
          />

          {/* 🌟 SEPARATE CLEAN BENEFITS LIST COMPONENT */}
          <AppBenefitsList />
        </View>
      </ScrollView>

      {/* Floating Checkout Footer Container */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <TouchableOpacity
          onPress={handlePay}
          disabled={isSubmitDisabled}
          activeOpacity={0.8}
          style={[
            styles.subscribeButton,
            isSubmitDisabled && styles.disabledButton,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t("subscription.payGoogle")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
// Keep your existing createStyles configuration exactly as it is...
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 12,
      paddingBottom: 120,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    logoWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.text,
      letterSpacing: 1.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textLight,
      textAlign: "center",
      lineHeight: 22,
      letterSpacing: 0.3,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
    },
    benefitsCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    benefitsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    benefitsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    benefitsList: {
      gap: theme.spacing.md,
    },
    benefitItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    iconWrapper: {
      width: 30,
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textLight,
      lineHeight: 20,
      fontWeight: "500",
    },
    footerContainer: {
      position: "absolute",
      bottom: 8,
      width: "100%",
      paddingHorizontal: 24, // More horizontal padding makes it look more "floating"
      paddingTop: 8,
      backgroundColor: "transparent",
    },
    subscribeButton: {
      backgroundColor: theme.colors.primary,
      height: 56, // Slightly taller for a premium feel
      borderRadius: 14, // Perfectly round "Pill" shape
      alignItems: "center",
      justifyContent: "center",
      // Stronger floating shadow
      elevation: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    disabledButton: {
      backgroundColor: theme.colors.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700", // Extra bold for emphasis
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
