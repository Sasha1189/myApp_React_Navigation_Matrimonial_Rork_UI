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
      activeOpacity={0.7}
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Icon
        size={14} // Slightly smaller for a more refined look
        color={isActive ? theme.colors.primary : theme.colors.textLight}
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
      paddingVertical: 8, // Fixed height for consistency
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1, // Thinner border is more modern
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.round, // Pill-shaped
      backgroundColor: theme.colors.card,
      // Subtle shadow for depth
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    activeTabButton: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight, // Using your new theme variable
      elevation: 0, // Flatten when active
    },
    tabText: {
      marginLeft: 6,
      fontSize: theme.fontSize.xs, // Smaller font + spacing = "Pro" look
      fontWeight: "600",
      color: theme.colors.textLight,
      letterSpacing: 0.3,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
  });
