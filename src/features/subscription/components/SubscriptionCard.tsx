import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check, Star } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface SubscriptionCardProps {
  planId: "basic" | "premium";
  skuId: string;
  fallbackPrice: string;
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
  const { tier } = useAuth();

  // 1. 🌟 ONLY MAP THE FEATURES FROM YOUR TRANSLATION FILE
  const features =
    planId === "basic"
      ? [
          t("subscription.plans.basic.features.0", "Verified Lonari Profile"),
          t(
            "subscription.plans.basic.features.1",
            "Browse our community members",
          ),
          t("subscription.plans.basic.features.2", "See your liked Profile"),
          t(
            "subscription.plans.basic.features.3",
            "Message directly to find your soul partner",
          ),
        ]
      : [
          t(
            "subscription.plans.premium.features.0",
            "'Premium' Badge on Profile",
          ),
          t(
            "subscription.plans.premium.features.1",
            "Express your lifestyle as Premium",
          ),
          t(
            "subscription.plans.premium.features.2",
            "High-quality photo uploads",
          ),
          t("subscription.plans.premium.features.3", "See who liked you"),
          t("subscription.plans.premium.features.4", "Advanced filters"),
          t(
            "subscription.plans.premium.features.5",
            "Message directly to find your soul partner",
          ),
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

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        { borderColor: theme.colors.border },
        isSelected && { borderColor: theme.colors.primary },
        planId === "premium" &&
          !isSelected && { borderColor: theme.colors.warning },
      ]}
      onPress={() => !isCurrentActivePlan && onSelect()}
    >
      {planId === "premium" && (
        <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
          <Star size={10} color="white" fill="white" />
          <Text style={styles.badgeText}>
            {t("subscription.mostPopular", "Most Loved")}
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          {/* 🌟 Plan Name directly from Google Play Console */}
          <Text
            style={[styles.name, isSelected && { color: theme.colors.primary }]}
          >
            {playStoreTitle}
          </Text>

          {/* Pricing Block */}
          <View style={styles.priceContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              {/* 🌟 Active price directly from Google Play */}
              <Text style={styles.price}>{livePayPrice}</Text>

              <Text style={styles.periodText}>
                / {t("subscription.onceYear", "Once a year")}
              </Text>

              {/* 🌟 Strikethrough base price directly from Google Play */}
              {originalBasePrice && (
                <Text style={styles.strikePrice}>{originalBasePrice}</Text>
              )}
            </View>

            {/* Badges row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
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

        {/* Selection / Active states */}
        {isCurrentActivePlan ? (
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>
              {t("subscription.currentPlan", "ACTIVE")}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.circle,
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
        )}
      </View>

      {/* Features List rendering */}
      <View
        style={[
          styles.featuresContainer,
          { borderTopColor: theme.colors.border },
        ]}
      >
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    padding: 20,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -12,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    zIndex: 10,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { fontSize: 17, fontWeight: "700" },
  priceContainer: { marginTop: 4, width: "100%" },
  price: { fontSize: 26, fontWeight: "800", color: "#333" },
  periodText: { fontSize: 12, color: "#666", fontWeight: "600", marginLeft: 4 },
  strikePrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    fontWeight: "500",
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#2ECC71",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  taxBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  taxBadgeText: {
    color: "#888",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTag: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTagText: { color: "#2ECC71", fontSize: 11, fontWeight: "700" },
  featuresContainer: { borderTopWidth: 1, paddingTop: 14, gap: 10 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14, color: "#666", fontWeight: "500" },
});
