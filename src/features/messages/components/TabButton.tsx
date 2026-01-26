import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../theme/index";

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
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Icon size={16} color={isActive ? "white" : theme.colors.primary} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  activeTabText: {
    color: "white",
  },
});
