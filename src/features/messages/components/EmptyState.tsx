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
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{t(`chat.empty.${type}Title`)}</Text>
      <Text style={styles.emptySubtext}>{t(`chat.empty.${type}Subtitle`)}</Text>
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textLight,
      textAlign: "center",
    },
  });
