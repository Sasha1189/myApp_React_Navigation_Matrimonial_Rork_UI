import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Crown } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { useSubscription } from "../hooks/useSubscription";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { AppBenefitsList } from "../components/AppBenefitsList";
import { PlanStatusView } from "../components/PlanStatusView";
import { SubscriptionFooter } from "../components/SubscriptionFooter";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useNavigation();

  const {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans,
    isLoadingPlans,
    hasError,
    refetchPlans,
  } = useSubscription();

  // 🟢 FIXED SYSTEM LOCKOUT: Modern TypeScript compliant pattern
  useEffect(() => {
    // 1. Assign the native event subscription to a variable reference
    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isProcessing) {
          return true; // Swallows the native hardware tap (does nothing)
        }
        return false; // Executes default pop navigation behavior
      },
    );

    // 2. Intercept React Navigation actions (Gestures / Header Buttons)
    const navigationUnsubscribe = navigation.addListener(
      "beforeRemove",
      (e) => {
        if (!isProcessing) {
          return; // Safe to exit screen
        }
        e.preventDefault(); // Stop swipe/tap animations from rendering
      },
    );

    // 3. Clean up events cleanly by calling .remove() on the subscription object
    return () => {
      backHandlerSubscription.remove(); // 🟢 Fixed: No more missing property error
      navigationUnsubscribe();
    };
  }, [isProcessing, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        pointerEvents={isProcessing ? "none" : "auto"}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Crown size={30} color={theme.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t("subscription.upgradeTitle")}</Text>
              <Text style={styles.subtitle}>
                {t("subscription.upgradeSubtitle")}
              </Text>
            </View>
            <Crown size={30} color={theme.colors.warning} />
          </View>

          {/* Section Indicator */}
          <Text style={styles.sectionLabel}>
            {t("subscription.choosePlan")}
          </Text>
          {/* 🌟 Dynamic fallback card loaders or error handling layout views */}
          <PlanStatusView
            isLoadingPlans={isLoadingPlans}
            hasError={hasError}
            refetchPlans={refetchPlans}
          />

          {/* Catalog Selection List displays natively when store records resolve */}
          {!isLoadingPlans && !hasError && (
            <>
              {/* Plan Card 1 */}
              <SubscriptionCard
                planId="basic"
                skuId="basic_membership_1y"
                availablePlans={availablePlans}
                isSelected={selectedPlanId === "basic"}
                onSelect={() => setSelectedPlanId("basic")}
              />

              {/* Plan Card 2 */}
              <SubscriptionCard
                planId="premium"
                skuId="premium_membership_1y"
                availablePlans={availablePlans}
                isSelected={selectedPlanId === "premium"}
                onSelect={() => setSelectedPlanId("premium")}
              />
            </>
          )}

          {/* 🌟 SEPARATE CLEAN BENEFITS LIST COMPONENT */}
          <AppBenefitsList />
        </View>
      </ScrollView>

      {/* Floating Checkout Footer Container */}
      <SubscriptionFooter
        selectedPlanId={selectedPlanId}
        isProcessing={isProcessing}
        isSubmitDisabled={isSubmitDisabled}
        handlePay={handlePay}
      />
    </View>
  );
}
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.sm, // Maps to your sm token (8px) or use md if you prefer 16px
      paddingBottom: 120, // Keep layout scroll clearance height constant
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm, // Maps to sm token (8px)
      marginBottom: theme.spacing.md, // Maps to md token (16px)
    },
    title: {
      fontSize: theme.fontSize.lg, // Maps to your lg token (18px) or choose xl (24px)
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.text,
      letterSpacing: 1.5,
    },
    subtitle: {
      fontSize: theme.fontSize.sm, // Maps to sm token (14px)
      color: theme.colors.textLight,
      textAlign: "center",
      lineHeight: 22,
      letterSpacing: 0.3,
    },
    sectionLabel: {
      fontSize: theme.fontSize.sm, // Maps to sm token (14px)
      fontWeight: "700",
      color: theme.colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: theme.spacing.xs, // Maps to xs token (4px)
      marginLeft: theme.spacing.xs, // Maps to xs token (4px)
    },
  });
