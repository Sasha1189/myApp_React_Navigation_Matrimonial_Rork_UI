import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface TabButtonProps {
  tab: "chats" | "sent" | "received";
  label: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onPress: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  tab,
  label,
  icon: Icon,
  isActive,
  onPress,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  if (!theme) return null;

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Icon
        size={16}
        color={isActive ? theme.colors.primary : theme.colors.primary}
      />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
    activeTabButton: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "20",
    },
    tabText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
  });
