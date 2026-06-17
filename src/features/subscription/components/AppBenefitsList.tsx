import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { SUPPORT_BENEFITS } from "../constants/supportBenefits";

export const AppBenefitsList = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.benefitsCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Visual Header Block */}
      <View style={styles.benefitsHeader}>
        <Heart
          size={20}
          color={theme.colors.primary}
          fill={theme.colors.primary}
        />
        <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
          {t("subscription.supportTitle", "Why Support Our Community")}
        </Text>
      </View>

      {/* Benefits Content Loop */}
      <View style={styles.benefitsList}>
        {SUPPORT_BENEFITS(theme).map((benefit) => (
          <View key={benefit.id} style={styles.benefitItem}>
            <View style={styles.iconWrapper}>{benefit.icon}</View>
            <Text
              style={[styles.benefitText, { color: theme.colors.textLight }]}
            >
              {t(benefit.translationKey, benefit.fallbackText)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  benefitsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  benefitsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  benefitsList: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 32,
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});
