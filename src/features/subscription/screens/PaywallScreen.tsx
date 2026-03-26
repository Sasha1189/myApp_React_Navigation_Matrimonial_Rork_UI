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
import { LanguageSelector } from "../../../components/LanguageSelector";

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { selectedPlanId, setSelectedPlanId, handlePay, isProcessing } =
    useSubscription();

  if (!theme) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <LanguageSelector />
          </View>
          {/* Header with Community Focus */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Crown size={40} color={theme.colors.warning} />
              <Text style={styles.title}>{t("subscription.upgradeTitle")}</Text>
            </View>
            <Text style={styles.subtitle}>
              {t("subscription.upgradeSubtitle")}
            </Text>
          </View>
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
          <View style={{ height: 120 }} /> {/* Extra padding for scroll */}
        </View>
      </ScrollView>

      {/* Fixed Sticky Footer Button */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 20) }, // Dynamic padding
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.subscribeButton,
            selectedPlanId === "basic" && styles.disabledButton,
          ]}
          onPress={handlePay}
          disabled={selectedPlanId === "basic" || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {selectedPlanId === "basic"
                ? t("subscription.currentPlan")
                : t("subscription.payGoogle")}
            </Text>
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
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: 40, // Space for the fixed footer
    },
    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.md,
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    logoWrapper: {
      flexDirection: "row", // Aligns icon and text horizontally
      alignItems: "center", // Centers them vertically relative to each other
      gap: 12, // Spacing between crown and text
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 22, // Slightly reduced to fit better inline
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textLight,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: theme.spacing.sm,
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
      bottom: 0,
      width: "100%",
      paddingHorizontal: 20,
      paddingTop: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    subscribeButton: {
      backgroundColor: theme.colors.primary,
      height: 56,
      borderRadius: theme.borderRadius.round,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    disabledButton: {
      backgroundColor: theme.colors.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });
