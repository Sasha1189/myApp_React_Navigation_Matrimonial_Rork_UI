import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  type: "chats" | "sent" | "received";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  if (!theme) return null;
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{t(`chat.empty.${type}Title`)}</Text>
        <Text style={styles.emptySubtext}>
          {t(`chat.empty.${type}Subtitle`)}
        </Text>
      </View>
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      // alignItems: "center",
    },
    emptyState: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.xxl,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: "hidden",
      elevation: 2,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    emptyText: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    emptySubtext: {
      fontSize: 12,
      color: theme.colors.textLight,
      textAlign: "center",
    },
  });
