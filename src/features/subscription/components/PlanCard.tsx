import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check, Star } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useTranslation } from "react-i18next";

interface PlanCardProps {
  plan: any;
  isSelected: boolean;
  onSelect: () => void;
}

export const PlanCardComponent = ({
  plan,
  isSelected,
  onSelect,
}: PlanCardProps) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <TouchableOpacity
      activeOpacity={0.9} // Re-enabled slight opacity for press feedback
      style={[
        styles.planCard,
        isSelected && styles.selectedPlan,
        plan.popular && !isSelected && styles.popularPlan,
      ]}
      onPress={onSelect}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Star size={10} color="white" fill="white" />
          <Text style={styles.popularText}>
            {t("subscription.mostPopular", "MOST POPULAR")}
          </Text>
        </View>
      )}

      {/* Simplified Inner View (No background change) */}
      <View style={styles.cardInner}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <View style={styles.nameContainer}>
              <Text
                style={[
                  styles.planName,
                  isSelected && { color: theme.colors.primary },
                ]}
              >
                {plan.name}
              </Text>
              {plan.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{plan.discount}</Text>
                </View>
              )}
            </View>

            {/* Selection Circle (Visual Focus) */}
            <View
              style={[
                styles.selectionCircle,
                {
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.border,
                },
                isSelected && { backgroundColor: theme.colors.primary },
              ]}
            >
              {isSelected && <Check size={14} color="white" strokeWidth={4} />}
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceMain}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/{plan.period}</Text>
            </View>
            {plan.originalPrice && (
              <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
            )}
          </View>
        </View>

        <View style={styles.featuresList}>
          {plan.features.map((feature: any, index: number) => (
            <View key={index} style={styles.featureItem}>
              <Check
                size={16}
                color={
                  feature.included
                    ? theme.colors.success
                    : `${theme.colors.textLight}50`
                }
              />
              <Text
                style={[
                  styles.featureItemText,
                  !feature.included && styles.excludedText,
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    planCard: {
      backgroundColor: theme.colors.card, // Static solid background
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      position: "relative",
      overflow: "visible", // Allows badge to show
      // Shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardInner: {
      padding: 20,
      // Removed overflow: hidden as we no longer have a background to clip
    },
    selectedPlan: {
      borderColor: theme.colors.primary, // Only the border highlights
      elevation: 4, // Slight lift effect on Android
    },
    popularPlan: {
      borderColor: theme.colors.warning,
    },
    popularBadge: {
      position: "absolute",
      top: -12,
      right: 20,
      backgroundColor: theme.colors.warning,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
      zIndex: 10,
    },
    popularText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    footerContainer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      paddingHorizontal: 20,
      // Add dynamic paddingBottom in your screen using useSafeAreaInsets
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    subscribeButton: {
      backgroundColor: theme.colors.primary,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 8, // Strong Android shadow
    },
    planHeader: {
      marginBottom: 16,
      backgroundColor: "transparent",
    },
    planTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    planName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    discountBadge: {
      backgroundColor: theme.colors.success + "15",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    discountText: {
      color: theme.colors.success,
      fontSize: 12,
      fontWeight: "700",
    },
    selectionCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "flex-start",
      gap: 4,
    },
    priceMain: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    price: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
    },
    period: {
      fontSize: 14,
      color: theme.colors.textLight,
      fontWeight: "500",
    },
    originalPrice: {
      fontSize: 14,
      color: theme.colors.textLight,
      textDecorationLine: "line-through",
      marginLeft: 8,
    },
    featuresList: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
      gap: 12,
      backgroundColor: "transparent",
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    featureItemText: {
      fontSize: 14,
      color: theme.colors.textLight,
      fontWeight: "500",
    },
    excludedText: {
      color: theme.colors.textLight,
      opacity: 0.6,
    },
  });
