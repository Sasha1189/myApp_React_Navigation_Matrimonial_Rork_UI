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
  color?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onLike,
  onMessage,
  onProfileDetails,
  disabled = false,
  liked = false,
  color = true,
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
          <ThumbsUp
            color={color ? theme.colors.success : theme.colors.textLight}
            size={40}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onMessage()}
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
        onPress={() => onProfileDetails()}
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
    justifyContent: "center",
    alignItems: "center",
  },
});
