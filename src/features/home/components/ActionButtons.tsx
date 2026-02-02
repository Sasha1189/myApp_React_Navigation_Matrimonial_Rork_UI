import { theme } from "../../../constants/theme";
import {
  Heart,
  Star,
  X,
  ThumbsUp,
  MessageCircleMore,
  MessageSquareMore,
  ArrowDownAZ,
  ArrowDownIcon
} from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
  liked?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPass,
  onLike,
  onSuperLike,
  disabled = false,
  liked = false,
}) => {
  const scaleValue = new Animated.Value(1);

  const animatePress = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => animatePress(onLike)}
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
          <ThumbsUp color={theme.colors.success} size={40} /> // ⭕ outline
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => animatePress(onSuperLike)}
        disabled={disabled}
        testID="superlike-button"
      >
        <MessageCircleMore size={40} color={theme.colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => animatePress(onPass)}
        disabled={disabled}
        testID="pass-button"
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
    justifyContent: "center",
    alignItems: "center",
  },
});
