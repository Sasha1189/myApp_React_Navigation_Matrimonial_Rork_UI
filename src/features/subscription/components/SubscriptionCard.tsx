import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check, Star } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface SubscriptionCardProps {
  planId: "basic" | "premium";
  skuId: string;
  availablePlans: any[];
  isSelected: boolean;
  onSelect: () => void;
}

export const SubscriptionCard = ({
  planId,
  skuId,
  availablePlans,
  isSelected,
  onSelect,
}: SubscriptionCardProps) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { tier } = useAuth();

  // 1. 🌟 ONLY MAP THE FEATURES FROM YOUR TRANSLATION FILE
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

  // 2. Cross-reference with the live Play Store object
  const playStoreProduct = availablePlans?.find(
    (product) => product.id === skuId,
  );

  if (!playStoreProduct) return null;

  // 3. 🌟 KEEP STORE THINGS AS THEY ARE DIRECTLY FROM GOOGLE PLAY
  const playStoreTitle = playStoreProduct.displayName;
  let livePayPrice = playStoreProduct.displayPrice; // Base price (e.g. ₹1,699.00)
  let originalBasePrice = undefined;

  // Detect and handle the console offers array directly
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

  const isCurrentActivePlan = tier?.toLowerCase() === planId.toLowerCase();

  // Evaluate card status variables to dynamically swap outline borders gracefully
  const cardBorderColor = isCurrentActivePlan
    ? theme.colors.success
    : isSelected
      ? theme.colors.primary
      : planId === "premium"
        ? theme.colors.warning
        : theme.colors.border;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { borderColor: cardBorderColor }]}
      onPress={() => !isCurrentActivePlan && onSelect()}
    >
      {/* Show Most Loved Badge on Premium Cards */}
      {planId === "premium" && (
        <View style={styles.badge}>
          <Star size={10} color="white" fill="white" />
          <Text style={styles.badgeText}>{t("subscription.mostPopular")}</Text>
        </View>
      )}

      {/* Main Core Metadata Header block */}
      <View style={styles.headerRow}>
        <View style={styles.titleAndPriceBlock}>
          {/* Plan Title Name directly from Play Console */}
          <Text style={[styles.name, isSelected && styles.nameSelected]}>
            {playStoreTitle}
          </Text>

          {/* Pricing Display Sub-Section */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              {/* Active Retail Charge Value */}
              <Text style={styles.price}>{livePayPrice}</Text>

              {/* Billing Cycle Frequency Indicator */}
              <Text style={styles.periodText}>
                / {t("subscription.onceYear")}
              </Text>

              {/* Original Strikethrough Price if Discount Offer exists */}
              {originalBasePrice && (
                <Text style={styles.strikePrice}>{originalBasePrice}</Text>
              )}
            </View>

            {/* Badges Container row (Discounts & Regulatory Tax details) */}
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

        {/* Action Selection State Render Controls */}
        {isCurrentActivePlan ? (
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>
              {t("subscription.currentPlan")}
            </Text>
          </View>
        ) : (
          <View style={[styles.circle, isSelected && styles.circleSelected]}>
            {isSelected && <Check size={14} color="white" strokeWidth={4} />}
          </View>
        )}
      </View>

      {/* Benefits checklist footer layout */}
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
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md, // Maps to md token (16px)
    },
    titleAndPriceBlock: {
      flex: 1,
      paddingRight: theme.spacing.sm, // Prevent clipping against the selection circle
    },
    name: {
      fontSize: theme.fontSize.lg, // Maps to lg token (18px)
      fontWeight: "700",
      color: theme.colors.text,
    },
    nameSelected: {
      color: theme.colors.primary,
    },
    priceContainer: {
      marginTop: theme.spacing.xs, // Maps to xs token (4px)
      width: "100%",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
    },
    price: {
      fontSize: theme.fontSize.xxl, // Boosted to xxl (32px) to match your requested size (26px) perfectly
      fontWeight: "800",
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
      marginTop: theme.spacing.sm,
      flexWrap: "wrap",
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
      // Styled using adaptive transparent context block configurations
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
