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
  itemSize: number;
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
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
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
      height: "100%", // 👑 Ensure card fills its layout context to map percentage metrics accurately
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: "hidden",
      alignSelf: "center",
      position: "relative",
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    cardContent: {
      position: "absolute",
      bottom: 0, // 👑 Sit directly flush against the base edge
      left: 0,
      right: 0, // 👑 Open to full width for symmetrical horizontal centering alignments
      height: "40%", // 👑 Forces content container layout to strictly consume the bottom 40% of space
      padding: 20,
      justifyContent: "center", // 👑 Centers content blocks vertically within that 40% window pane
      alignItems: "center", // 👑 Centers row and button blocks completely horizontally
    },
    statusInfoWrapper: {
      flexDirection: "row",
      alignItems: "center", // 👑 Snaps the icon and text block to align seamlessly on a single horizontal row axis
      justifyContent: "center", // 👑 Centers the entire combined row container horizontally
      marginBottom: 20,
      width: "100%",
      gap: 12, // 👑 Unified modern flex spacing separator replacing old margin offsets
    },
    iconFit: {
      // 👑 Removed old bottom padding bounds to maintain perfect row geometry alignment
    },
    title: {
      fontSize: 21,
      fontWeight: "800",
      color: "white",
      letterSpacing: 1.5,
      marginBottom: 3,
      textAlign: "left", // Keep text readable inside the row profile alignment blocks
    },
    message: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 1.2,
      textAlign: "left",
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 32, // Expanded pad parameters for cleaner button presentation balances
      borderRadius: 12,
      alignSelf: "center", // 👑 Centers the action button horizontally inside your layout view matrix
    },
    buttonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 14,
      textAlign: "center",
    },
  });
