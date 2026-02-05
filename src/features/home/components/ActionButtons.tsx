import { theme } from "../../../constants/theme";
import {
  Heart,
  Star,
  X,
  ThumbsUp,
  MessageCircleMore,
  MessageSquareMore,
  ArrowDownAZ,
  ArrowDownIcon,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onLike: () => void;
  onMessage: () => void;
  onProfileDetails: () => void;
  disabled?: boolean;
  liked?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onLike,
  onMessage,
  onProfileDetails,
  disabled = false,
  liked = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onLike()}
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
          <ThumbsUp color={theme.colors.success} size={40} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onMessage()}
        disabled={disabled}
        testID="message-button"
      >
        <MessageCircleMore size={40} color={theme.colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onProfileDetails()}
        disabled={disabled}
        testID="profile-details-button"
      >
        <ArrowDownAZ size={40} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  button: {
    // opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
