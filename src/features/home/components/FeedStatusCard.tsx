import React from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Info, AlertCircle } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface FeedStatusCardProps {
  type: "loading" | "error" | "empty";
  title: string;
  message: string;
  onAction?: () => void;
  actionText?: string;
  itemSize: number; // 👈 Now required so it scales perfectly with your available flatlist height
}

const { width: screenWidth } = Dimensions.get("window");

export function FeedStatusCard({
  type,
  title,
  message,
  onAction,
  actionText,
  itemSize,
}: FeedStatusCardProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (!theme) return null;

  return (
    // 💡 Blends inline dynamic heights directly into your SwipeCard structural skeleton
    <View style={[styles.card, { height: itemSize }]}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/profile.webp")}
          style={styles.image}
          contentFit={"cover"}
          cachePolicy="disk"
          transition={200}
        />
        {/* Matches the premium dark tint look used behind swipe texts */}
        <View style={styles.darkOverlay} />
      </View>

      {/* Styled and aligned exactly like cardContent inside SwipeCard */}
      <View style={styles.cardContent}>
        <View style={styles.statusInfoWrapper}>
          <View style={styles.iconFit}>
            {type === "loading" && (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )}
            {type === "error" && (
              <AlertCircle size={44} color={theme.colors.danger} />
            )}
            {type === "empty" && (
              <Info size={44} color={theme.colors.primary} />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {onAction && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      // 🎯 EXACT match to SwipeCard layout skeleton boundaries
      width: screenWidth - 12 * 2,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: "hidden",
      alignSelf: "center",
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    darkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.55)", // Slightly deeper mask to ensure error/loading headers stand out sharp
    },
    cardContent: {
      // 🎯 EXACT padding and positioning matching your SwipeCard layout content bounding box
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 60, // Matches your right-hand floating actions layout padding
      padding: 20,
    },
    statusInfoWrapper: {
      alignItems: "flex-start", // Matches your text block alignments
      marginBottom: 15,
    },
    iconFit: {
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "800", // Matches your SwipeCard name styling
      color: "white",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    message: {
      color: "rgba(255,255,255,0.8)", // Matches your exact swipe bio coloring
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.3,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginTop: 5,
      alignSelf: "flex-start",
    },
    buttonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 14,
      textAlign: "center",
    },
  });
