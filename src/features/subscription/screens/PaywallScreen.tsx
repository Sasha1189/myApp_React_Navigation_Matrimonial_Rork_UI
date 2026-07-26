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
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTheme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {
    selectedPlanId,
    setSelectedPlanId,
    handlePay,
    isProcessing,
    isSubmitDisabled,
    availablePlans,
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
        pointerEvents={isProcessing ? "none" : "auto"}
      >
        <TouchableOpacity
          onPress={handlePay}
          disabled={isSubmitDisabled}
          activeOpacity={0.8}
          style={[
            styles.subscribeButton,
            !selectedPlanId && !isProcessing && styles.disabledButton,
            isProcessing && { opacity: 0.9 },
          ]}
        >
          {isProcessing ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: "100%",
                paddingHorizontal: 12,
              }}
            >
              <ActivityIndicator color="white" size="small" animating={true} />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: "white",
                    flexShrink: 1,
                    textAlign: "center",
                    fontSize: 15,
                  },
                ]}
              >
                {t("subscription.processingPayment")}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.buttonText,
                {
                  color: !selectedPlanId ? theme.colors.textLight : "white",
                },
              ]}
            >
              {t("subscription.payGoogle")}
            </Text>
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
      fontSize: 18,
      fontWeight: "700", // Extra bold for emphasis
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
