import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronUp, MessageSquare } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";

interface FloatingProps {
  isLive: boolean;
  hasNewContent: boolean;
  onReset: () => void;
  mode: "inbox" | "chat";
}

export const ChatFloatingUI = ({
  isLive,
  hasNewContent,
  onReset,
  mode,
}: FloatingProps) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  if (isLive || !theme) return null;

  return (
    <View style={styles.floatingContainer}>
      {hasNewContent && (
        <TouchableOpacity style={styles.badge} onPress={onReset}>
          <MessageSquare size={16} color="#FFF" />
          <Text style={styles.badgeText}>
            New {mode === "inbox" ? "Chat" : "Message"}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.fab} onPress={onReset}>
        <ChevronUp size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    floatingContainer: {
      position: "absolute",
      bottom: 100,
      right: theme.spacing.md,
      alignItems: "flex-end",
      zIndex: 999,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.5,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.accent,
      marginBottom: theme.spacing.md,
      elevation: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: theme.fontSize.sm,
      fontWeight: "bold",
      marginLeft: theme.spacing.xs,
    },
  });
