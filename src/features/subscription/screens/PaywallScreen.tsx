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
import {
  Crown,
  Check,
  Star,
  Zap,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppTheme } from "@/theme/theme";
import { PlanCardComponent } from "../components/PlanCard";

export default function SubscriptionScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { selectedPlanId, setSelectedPlanId, handlePay, isProcessing } =
    useSubscription();

  if (!theme) return null;

  // Use your EXACT existing renderPlan logic here, just mapped to SUBSCRIPTION_PLANS
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary + "20", "transparent"]}
        style={styles.headerGradient}
      />

      <View style={styles.content}>
        {/* Header UI - Same as your original */}
        <View style={styles.headerCard}>
          <Crown size={32} color={theme.colors.warning} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Upgrade Your Experience</Text>
          </View>
        </View>

        {/* Benefits UI - Same as your original */}
        <View style={styles.benefitsCard}>
          {/* ... your benefit Zap/Eye/Heart icons ... */}
        </View>

        {/* Plans - Mapping from constants */}
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCardComponent
            theme={theme}
            styles={styles}
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}

        {/* Subscribe Button */}
        <TouchableOpacity style={styles.subscribeButton} onPress={handlePay}>
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {selectedPlanId === "trial"
                ? "Start Trial"
                : "Pay with Google Play"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    subscribeButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 20,
      marginBottom: 40,
      // Add shadow for premium feel
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    subscribeButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    selectedPlan: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "05", // Subtle highlight
    },
    popularPlan: {
      borderColor: theme.colors.warning,
      borderWidth: 2,
    },
    // Ensure feature text is readable
    featureText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
    },
    excludedText: {
      color: theme.colors.textLight,
      textDecorationLine: "none", // or 'line-through' if you prefer
    },
    headerGradient: {
      height: 100,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    content: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    headerCard: {
      backgroundColor: "white",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      flexDirection: "row",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      lineHeight: 20,
    },
    benefitsCard: {
      backgroundColor: "white",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    benefitsTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    benefitsList: {
      gap: theme.spacing.md,
    },
    benefitItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    benefitText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
      fontWeight: "500",
    },
    plansContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    planCard: {
      backgroundColor: "white",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      position: "relative",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    // selectedPlan: {
    //   borderColor: theme.colors.primary,
    // },
    // popularPlan: {
    //   borderColor: theme.colors.warning,
    // },
    popularBadge: {
      position: "absolute",
      top: -10,
      left: theme.spacing.lg,
      backgroundColor: theme.colors.warning,
      borderRadius: theme.borderRadius.round,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      flexDirection: "row",
      alignItems: "center",
    },
    popularText: {
      color: "white",
      fontSize: theme.fontSize.xs,
      fontWeight: "bold",
      marginLeft: theme.spacing.xs,
    },
    planHeader: {
      marginBottom: theme.spacing.lg,
    },
    planTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    planName: {
      fontSize: theme.fontSize.xl,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    discountBadge: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginLeft: theme.spacing.md,
    },
    discountText: {
      color: "white",
      fontSize: theme.fontSize.xs,
      fontWeight: "bold",
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
    },
    price: {
      fontSize: theme.fontSize.xxl,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    period: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      marginLeft: theme.spacing.xs,
    },
    originalPrice: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      textDecorationLine: "line-through",
      marginLeft: theme.spacing.sm,
    },
    featuresContainer: {
      gap: theme.spacing.sm,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureIcon: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.round,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    includedIcon: {
      backgroundColor: theme.colors.success + "20",
    },
    excludedIcon: {
      backgroundColor: theme.colors.textLight + "20",
    },
    // featureText: {
    //   fontSize: theme.fontSize.sm,
    //   color: theme.colors.text,
    //   flex: 1,
    // },
    // excludedText: {
    //   color: theme.colors.textLight,
    //   textDecorationLine: "line-through",
    // },
    // subscribeButton: {
    //   borderRadius: theme.borderRadius.lg,
    //   marginBottom: theme.spacing.lg,
    //   overflow: "hidden",
    // },
    // disabledButton: {
    //   opacity: 0.6,
    // },
    // subscribeGradient: {
    //   flexDirection: "row",
    //   alignItems: "center",
    //   justifyContent: "center",
    //   paddingVertical: theme.spacing.lg,
    //   paddingHorizontal: theme.spacing.xl,
    // },
    subscribeText: {
      color: "white",
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      marginLeft: theme.spacing.sm,
    },
    guaranteeCard: {
      backgroundColor: theme.colors.success + "10",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      flexDirection: "row",
    },
    guaranteeContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    guaranteeTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "bold",
      color: theme.colors.success,
      marginBottom: theme.spacing.xs,
    },
    guaranteeText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      lineHeight: 20,
    },
  });
