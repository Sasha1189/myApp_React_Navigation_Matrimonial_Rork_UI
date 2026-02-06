import React, { useRef } from "react";
import {
  View,
  Text,
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
import { ActionButtons } from "../components/ActionButtons";

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
  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={1} style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/profile.png")}
          style={styles.image}
          contentFit={"cover"}
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
              <AlertCircle size={40} color={theme.colors.danger} />
            )}
            {type === "empty" && (
              <Info size={40} color={theme.colors.primary} />
            )}
          </View>
          <Text style={styles.title}>{title}</Text>
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
          {/* <TouchableOpacity style={styles.dummybutton}>
            <ThumbsUp color={theme.colors.textLight} size={40} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dummybutton}>
            <MessageCircleMore size={40} color={theme.colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dummybutton}>
            <ArrowDownAZ size={40} color={theme.colors.textLight} />
          </TouchableOpacity> */}
          <ActionButtons
            onLike={() => void 0}
            onMessage={() => void 0}
            onProfileDetails={() => void 0}
            disabled={true}
            color={false}
          />
        </View>
      </View>
    </View>
  );
}
//just for empty feed to view previous profiles
export function FeedPreviousProfiles({
  currentIndex,
  updateIndex,
}: {
  currentIndex: number;
  updateIndex: (index: number) => void;
}) {
  return (
    <View style={styles.previousFeedBtnContainer}>
      <TouchableOpacity
        onPress={() => updateIndex(currentIndex - 1)}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonText}>View Previous Profiles</Text>
      </TouchableOpacity>
    </View>
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
    bottom: 60,
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
    textAlignVertical: "center",
    marginBottom: 10,
    color: theme.colors.text,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },

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
  previousFeedBtnContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 55,
    padding: theme.spacing.lg,
  },
});
