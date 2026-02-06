import React, { useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import {
  Info,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  MessageCircleMore,
  ArrowDownAZ,
} from "lucide-react-native";
import { theme } from "../../../constants/theme";
import type { FeedHookResult } from "../type/type";

interface FeedStatusCardProps {
  type: "loading" | "error" | "empty";
  title: string;
  message: string;
  onAction?: () => void;
  actionText?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function FeedStatusCard({
  type,
  title,
  message,
  onAction,
  actionText,
}: FeedStatusCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const rotateCard = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotateCard },
    ],
  };

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <TouchableOpacity activeOpacity={1} style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/profile.png")}
          style={styles.image}
          contentFit={"contain"}
          cachePolicy="disk"
          transition={200}
        />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <View style={styles.iconFit}>
            {type === "loading" && (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )}
            {type === "error" && (
              <AlertCircle size={60} color={theme.colors.danger} />
            )}
            {type === "empty" && (
              <Info size={60} color={theme.colors.primary} />
            )}
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.message, { color: theme.colors.textLight }]}>
          {message}
        </Text>

        {onAction && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={onAction}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.dummybutton}>
            <ThumbsUp color={theme.colors.textLight} size={40} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dummybutton}>
            <MessageCircleMore size={40} color={theme.colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dummybutton}>
            <ArrowDownAZ size={40} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export function FeedPreviousProfiles({
  currentIndex,
  updateIndex,
}: {
  currentIndex: number;
  updateIndex: (index: number) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => updateIndex(currentIndex - 1)}
      style={styles.actionsContainer}
    >
      <Text style={{ color: theme.colors.primary }}>
        View Previous Profiles
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: screenWidth - 20,
    height: screenHeight * 0.75,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.cardBackground,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 55,
    padding: theme.spacing.lg,
  },
  content: { alignItems: "center" },
  iconContainer: { flexDirection: "row" },
  iconFit: { margin: 10 },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.xl,
  },
  image: { width: "100%", height: "100%", borderRadius: theme.borderRadius.xl },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },

  actionsContainer: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    alignItems: "flex-end",
    elevation: 10,
  },
  rightActions: {
    alignItems: "center",
  },
  dummybutton: {
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
