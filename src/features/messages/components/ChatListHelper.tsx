import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ChevronUp, MessageSquare } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";

interface ChatHelperProps {
  isLive: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasNewContent: boolean; // For "New Message at Top" or "New Message Below"
  onLoadMore: () => void;
  onReset: () => void;
  mode: "inbox" | "chat"; // Adjusts text/icons for the specific screen
  theme: any;
}
export const ChatListHelper = ({
  isLive,
  hasMore,
  isLoadingMore,
  hasNewContent,
  onLoadMore,
  onReset,
  mode,
  theme, // Use the theme from props
  styles, // Pass styles from parent
}: ChatHelperProps & { styles: any }) => {
  const renderFooter = () => {
    // ❌ REMOVE HOOKS FROM HERE
    if (!hasMore && !isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        {isLoadingMore ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <TouchableOpacity onPress={onLoadMore} style={styles.loadBtn}>
            <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
              {mode === "inbox" ? "Load Older Chats" : "Load Earlier Messages"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFloating = () => {
    // ❌ REMOVE HOOKS FROM HERE
    if (isLive) return null;

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

  return { renderFooter, renderFloating };
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footer: {
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    loadBtn: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.round, // Clean pill shape
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      minWidth: 150,
      alignItems: "center",
      // Subtle shadow for the button
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },

    // --- ChatListHelper: Floating UI ---
    floatingContainer: {
      position: "absolute",
      bottom: 100, // Anchored above the input bar
      right: theme.spacing.md,
      alignItems: "flex-end",
      zIndex: 999,
    },
    fab: {
      width: 56, // Standard high-end FAB size (56x56)
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
