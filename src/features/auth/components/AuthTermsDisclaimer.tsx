import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

interface AuthTermsDisclaimerProps {
  openLink: (url: string, title: string) => void;
}

export const AuthTermsDisclaimer: React.FC<AuthTermsDisclaimerProps> = ({
  openLink,
}) => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.disclaimerText}>
        {t("auth.agreePrefix", "By continuing, you agree to our ")}
        <Text
          style={styles.linkText}
          onPress={() =>
            openLink(
              "https://sasha1189.github.io/youva-Lonari/terms.html",
              "Terms",
            )
          }
        >
          {t("auth.termsLinkText", "Terms of Service")}
        </Text>
        {t("auth.agreeConjunction", " and ")}
        <Text
          style={styles.linkText}
          onPress={() =>
            openLink(
              "https://sasha1189.github.io/youva-Lonari/privacy.html",
              "Privacy",
            )
          }
        >
          {t("auth.privacyLinkText", "Privacy Policy")}
        </Text>
        {t("auth.agreeSuffix", ".")}
      </Text>
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
      alignItems: "center",
    },
    disclaimerText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      lineHeight: 18,
      fontWeight: "400",
      textAlign: "center",
    },
    linkText: {
      color: theme.colors.accent || "#1c7ed6",
      fontWeight: "600",
    },
  });
