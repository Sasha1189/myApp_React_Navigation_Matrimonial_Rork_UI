import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthNavigation } from "../../../navigation/hooks";
import { Heart, Sparkles, Users } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  if (!theme) return null;

  const navigation = useAuthNavigation();
  const handleGetStarted = () => {
    navigation.navigate("PhoneSignIn");
  };

  const features = [
    { icon: Sparkles, text: t("welcome.features.match") },
    { icon: Users, text: t("welcome.features.secure") },
    { icon: Heart, text: t("welcome.features.connect") },
  ];

  console.log("Rendering LandingScreen:114");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <LanguageSelector />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Heart
              size={40}
              color={theme.colors.primary}
              fill={theme.colors.primary}
            />
          </View>
          <Text style={styles.appName}>{t("welcome.appName")}</Text>
          <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.iconWrapper}>
                <item.icon size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>{t("welcome.getStarted")}</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>{t("welcome.termsAgreement")}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: "space-evenly",
    },
    header: {
      alignItems: "center",
      marginTop: height * 0.02,
    },
    logoWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    appName: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
    },
    tagline: {
      fontSize: 16,
      color: theme.colors.textLight,
      textAlign: "center",
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    featuresContainer: {
      width: "100%",
      gap: theme.spacing.md,
    },
    featureCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
    },
    featureText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    bottomSection: {
      alignItems: "center",
      paddingBottom: theme.spacing.lg,
      width: "100%",
    },
    getStartedButton: {
      backgroundColor: theme.colors.primary,
      width: "100%",
      paddingVertical: 18,
      borderRadius: theme.borderRadius.round,
      marginBottom: theme.spacing.lg,
      alignItems: "center",
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    getStartedText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    termsText: {
      color: theme.colors.textLight,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: theme.spacing.md,
    },
  });
