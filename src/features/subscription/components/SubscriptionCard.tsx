import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check, Star } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";
import { useTranslation } from "react-i18next";
import { useTierStatus } from "../hooks/useTierStatus";

interface SubscriptionCardProps {
  planId: "basic" | "premium";
  skuId: string;
  availablePlans: any[];
  isSelected: boolean;
  onSelect: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  planId,
  skuId,
  availablePlans,
  isSelected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const { getCardState } = useTierStatus();
  const { isCurrentSubscription, isExpiredPlan, showSelectCircle } =
    getCardState(planId);

  const features =
    planId === "basic"
      ? [
          t("subscription.plans.basic.features.0"),
          t("subscription.plans.basic.features.1"),
          t("subscription.plans.basic.features.2"),
          t("subscription.plans.basic.features.3"),
        ]
      : [
          t("subscription.plans.premium.features.0"),
          t("subscription.plans.premium.features.1"),
          t("subscription.plans.premium.features.2"),
          t("subscription.plans.premium.features.3"),
          t("subscription.plans.premium.features.4"),
          t("subscription.plans.premium.features.5"),
        ];

  const playStoreProduct = availablePlans?.find(
    (product) => product.id === skuId,
  );

  if (!playStoreProduct) return null;

  const playStoreTitle = playStoreProduct.displayName;
  let livePayPrice = playStoreProduct.displayPrice;
  let originalBasePrice = undefined;

  if (
    playStoreProduct.platform === "android" &&
    playStoreProduct.discountOffers
  ) {
    const activePromoOffer = playStoreProduct.discountOffers.find(
      (offer: any) => offer.id,
    );
    if (activePromoOffer) {
      livePayPrice = activePromoOffer.displayPrice;
      originalBasePrice = playStoreProduct.displayPrice;
    }
  }

  // Active -> Green | Selected (including Expired) -> Primary Highlight | Unselected -> Standard/Warning
  const cardBorderColor = isCurrentSubscription
    ? theme.colors.success
    : isSelected
      ? theme.colors.primary
      : isExpiredPlan
        ? theme.colors.danger
        : planId === "premium"
          ? theme.colors.warning
          : theme.colors.border;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { borderColor: cardBorderColor }]}
      disabled={isCurrentSubscription}
      onPress={onSelect}
    >
      {/* Most Popular Badge for Premium */}
      {planId === "premium" && (
        <View style={styles.badge}>
          <Star size={10} color="white" fill="white" />
          <Text style={styles.badgeText}>{t("subscription.mostPopular")}</Text>
        </View>
      )}

      {/* Header Block */}
      <View style={styles.headerRow}>
        <Text style={[styles.name, isSelected && styles.nameSelected]}>
          {playStoreTitle}
        </Text>
        <View style={styles.priceAndStatusRow}>
          {/* Left 80% Block */}
          <View style={styles.priceBlock}>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{livePayPrice}</Text>
                <Text style={styles.periodText}>
                  / {t("subscription.onceYear")}
                </Text>
                {originalBasePrice && (
                  <Text style={styles.strikePrice}>{originalBasePrice}</Text>
                )}
              </View>

              <View style={styles.badgesRow}>
                {originalBasePrice &&
                  playStoreProduct.discountOffers &&
                  (() => {
                    const promoOffer = playStoreProduct.discountOffers.find(
                      (offer: any) => offer.id,
                    );
                    const baseAmt = playStoreProduct.price;
                    const promoAmt = promoOffer?.price;

                    if (baseAmt && promoAmt && baseAmt > promoAmt) {
                      const pct = Math.round(
                        ((baseAmt - promoAmt) / baseAmt) * 100,
                      );
                      return (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            ~{pct}% Less
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}

                <View style={styles.taxBadge}>
                  <Text style={styles.taxBadgeText}>
                    INCL. 18% GST + 15% TAXES
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right 20% Status & Control Container */}
          <View style={styles.statusIndicatorContainer}>
            {/* 1. Selection Circle (Placed top so it renders above the status badge) */}
            {showSelectCircle && (
              <View
                style={[styles.circle, isSelected && styles.circleSelected]}
              >
                {isSelected && (
                  <Check size={14} color="white" strokeWidth={4} />
                )}
              </View>
            )}

            {/* 2. Active Plan Badge */}
            {isCurrentSubscription && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>
                  {t("subscription.currentPlan")}
                </Text>
              </View>
            )}

            {/* 3. Expired Plan Badge */}
            {isExpiredPlan && (
              <View style={styles.expiredTag}>
                <Text style={styles.expiredTagText}>
                  {t("subscription.expired")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        {features.map((featureText, index) => (
          <View key={index} style={styles.featureItem}>
            <Check size={16} color={theme.colors.success} />
            <Text style={styles.featureText}>{featureText}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export const createStyles = (theme: AppTheme) => {
  const isDarkTheme = theme.colors.background === "#0A0A1F";
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl, // Maps safely to your xl token (24px)
      marginBottom: theme.spacing.lg, // Maps cleanly to your lg token (24px)
      borderWidth: 2,
      padding: theme.spacing.lg,
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: -12,
      right: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round, // Uses your perfect circular token (999)
      gap: theme.spacing.xs,
      zIndex: 10,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: theme.fontSize.xs, // Maps to xs token (12px)
      fontWeight: "800",
    },
    headerRow: {},
    priceAndStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    priceBlock: {
      flex: 0.8,
    },
    name: {
      fontSize: theme.fontSize.lg, // Maps to lg token (18px)
      fontWeight: "600",
      color: theme.colors.text,
    },
    nameSelected: {
      color: theme.colors.primary,
    },
    priceContainer: {
      // marginTop: theme.spacing.xs, // Maps to xs token (4px)
      width: "100%",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    price: {
      fontSize: theme.fontSize.lg, // Boosted to xxl (32px) to match your requested size (26px) perfectly
      fontWeight: "600",
      color: theme.colors.text, // Dynamic color instead of hardcoded "#333"
    },
    periodText: {
      fontSize: theme.fontSize.xs, // Maps to xs token (12px)
      color: theme.colors.textLight,
      fontWeight: "600",
      marginLeft: theme.spacing.xs,
    },
    strikePrice: {
      fontSize: theme.fontSize.sm, // Maps to sm token (14px)
      color: theme.colors.textLight,
      textDecorationLine: "line-through",
      fontWeight: "500",
      marginLeft: theme.spacing.sm,
    },
    badgesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm, // Maps to sm token (8px)
      marginTop: theme.spacing.xs,
    },
    discountBadge: {
      // Swapped hardcoded light green to a secure adaptive theme alpha setup
      backgroundColor: isDarkTheme
        ? "rgba(76, 175, 80, 0.15)"
        : "rgba(46, 204, 113, 0.12)",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
    },
    discountBadgeText: {
      color: theme.colors.success, // References your theme success green dynamically
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    taxBadge: {
      // Swapped hardcoded translucent black to support light/dark variants natively
      backgroundColor: isDarkTheme
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: isDarkTheme
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
    },
    taxBadgeText: {
      color: theme.colors.textLight, // References light desaturated subtitle colors safely
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    statusIndicatorContainer: {
      flex: 0.2,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    circle: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.round,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    circleSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    activeTag: {
      backgroundColor: isDarkTheme
        ? "rgba(76, 175, 80, 0.2)"
        : "rgba(46, 204, 113, 0.15)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    activeTagText: {
      color: theme.colors.success,
      fontSize: 11,
      fontWeight: "700",
    },
    expiredTag: {
      backgroundColor: isDarkTheme
        ? "rgba(244, 67, 54, 0.2)"
        : "rgba(231, 76, 60, 0.15)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    expiredTagText: {
      color: theme.colors.danger,
      fontSize: 11,
      fontWeight: "700",
    },
    featuresContainer: {
      marginTop: theme.spacing.md,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 10, // Uses standard flex layouts instead of array iteration margin extensions
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    featureText: {
      fontSize: theme.fontSize.sm, // Maps perfectly to sm token (14px)
      color: theme.colors.textLight,
      fontWeight: "500",
      flex: 1,
    },
  });
};
