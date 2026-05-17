import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { useSubscription } from "../hooks/useSubscription";
import { SUBSCRIPTION_PLANS } from "../constants/plans";
import { SUPPORT_BENEFITS } from "../constants/supportBenefits"; // Import the new constants
import { Crown, Heart } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlanCardComponent } from "../components/PlanCard";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { tier } = useAuth();
  const {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
  } = useSubscription();

  if (!theme) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header with Community Focus */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Crown size={40} color={theme.colors.warning} />
            </View>
            <View style={{ flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.title}>{t("subscription.upgradeTitle")}</Text>
              <Text style={styles.subtitle}>
                {t("subscription.upgradeSubtitle")}
              </Text>
            </View>
          </View>
          {/* Plans Section */}
          <Text style={styles.sectionLabel}>
            {t("subscription.choosePlan", "Choose a Plan")}
          </Text>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const displayPlan = {
              ...plan,
              name: t(`subscription.plans.${plan.id}.name`, plan.name),
              price: t(`subscription.plans.${plan.id}.price`, plan.price),
              originalPrice: plan.originalPrice
                ? t(
                    `subscription.plans.${plan.id}.originalPrice`,
                    plan.originalPrice,
                  )
                : undefined,
              period: t(`subscription.plans.${plan.id}.period`, plan.period),
              discount: plan.discount
                ? t(`subscription.plans.${plan.id}.discount`, plan.discount)
                : undefined,
              features: plan.features.map((f, index) => ({
                ...f,
                text: t(
                  `subscription.plans.${plan.id}.features.${index}`,
                  f.text,
                ),
              })),
            };
            return (
              <PlanCardComponent
                key={plan.id}
                plan={displayPlan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            );
          })}
          {/* Support Card - Emotional Hook */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitsHeader}>
              <Heart
                size={20}
                color={theme.colors.primary}
                fill={theme.colors.primary}
              />
              <Text style={styles.benefitsTitle}>
                {t("subscription.supportTitle")}
              </Text>
            </View>
            <View style={styles.benefitsList}>
              {SUPPORT_BENEFITS(theme).map((benefit) => (
                <View key={benefit.id} style={styles.benefitItem}>
                  <View style={styles.iconWrapper}>{benefit.icon}</View>
                  <Text style={styles.benefitText}>
                    {t(benefit.translationKey)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 32) },
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
