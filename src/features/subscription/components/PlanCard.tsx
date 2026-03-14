import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, Star } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";

interface PlanCardProps {
  plan: any;
  isSelected: boolean;
  theme: AppTheme;
  styles: any;
  onSelect: () => void;
}

export const PlanCardComponent = ({
  plan,
  isSelected,
  theme,
  styles,
  onSelect,
}: PlanCardProps) => {
  const isFree = plan.price === "Free";

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        isSelected && styles.selectedPlan,
        plan.popular && styles.popularPlan,
      ]}
      onPress={onSelect}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Star size={16} color="white" fill="white" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View style={styles.planTitleContainer}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{plan.discount}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{plan.price}</Text>
          {!isFree && <Text style={styles.period}>{plan.period}</Text>}
          {plan.originalPrice && (
            <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
          )}
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature: any, index: number) => (
          <View key={index} style={styles.featureRow}>
            <View
              style={[
                styles.featureIcon,
                feature.included ? styles.includedIcon : styles.excludedIcon,
              ]}
            >
              <Check
                size={14}
                color={
                  feature.included
                    ? theme.colors.success
                    : theme.colors.textLight
                }
              />
            </View>
            <Text
              style={[
                styles.featureText,
                !feature.included && styles.excludedText,
              ]}
            >
              {feature.text}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};
