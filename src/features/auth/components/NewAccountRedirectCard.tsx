import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

interface NewAccountRedirectCardProps {
  onPress: () => void;
}

export const NewAccountRedirectCard: React.FC<NewAccountRedirectCardProps> = ({
  onPress,
}) => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.switchAuthModeContainer}
    >
      <Text style={styles.switchAuthModeText}>
        {t("auth.newHerePrefix", "New here?")}{" "}
        <Text style={styles.switchAuthModeLink}>
          {t("auth.createAccountLink", "Create Account")}
        </Text>
      </Text>
      <View style={styles.inlineBackButton}>
        <ArrowRight size={22} color="#F8F8F8" />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    switchAuthModeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.card,
    },
    switchAuthModeText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      fontWeight: "500",
    },
    switchAuthModeLink: {
      color: theme.colors.text,
      fontWeight: "700",
    },
    inlineBackButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
  });
