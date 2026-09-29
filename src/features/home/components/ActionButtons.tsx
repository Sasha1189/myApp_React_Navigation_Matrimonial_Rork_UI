import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThumbsUp, MessageCircleMore, ArrowDownAZ } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface ActionButtonsProps {
  onLike: () => void;
  onMessage: () => void;
  onProfileDetails: () => void;
  disabled?: boolean;
  liked?: boolean;
  color?: boolean;
}

export const ActionButtons = React.memo<ActionButtonsProps>(
  ({
    onLike,
    onMessage,
    onProfileDetails,
    disabled = false,
    liked,
    color = true,
  }) => {
    const { theme } = useAppTheme();
    const styles = useStyles(createStyles);

    if (!theme) return null;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={onLike}
          disabled={disabled}
          testID="like-button"
        >
          {liked ? (
            <ThumbsUp
              fill={theme.colors.success}
              color={theme.colors.success}
              size={40}
            /> // ✅ filled
          ) : (
            <ThumbsUp
              color={color ? theme.colors.success : theme.colors.textLight}
              size={40}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onMessage}
          disabled={disabled}
          testID="message-button"
        >
          <MessageCircleMore
            size={40}
            color={color ? theme.colors.primary : theme.colors.textLight}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onProfileDetails}
          disabled={disabled}
          testID="profile-details-button"
        >
          <ArrowDownAZ
            size={40}
            color={color ? theme.colors.danger : theme.colors.textLight}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
