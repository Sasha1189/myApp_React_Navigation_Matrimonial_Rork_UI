import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface PremiumBannerProps {
  onPress: () => void;
  styles: any;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  onPress,
  styles,
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.premiumCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#0A192F", "#1E3A8A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.premiumGrad}
      >
        <View style={styles.premiumContent}>
          <View style={styles.crownCircle}>
            <Crown size={20} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.premTitle}>{t("profile.premium.upgrade")}</Text>
            <Text style={styles.premSub}>{t("profile.premium.benefits")}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
