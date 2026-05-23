// import React from "react";
// import {
//   View,
//   Text,
//   Dimensions,
//   ActivityIndicator,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { Image } from "expo-image";
// import { Info, AlertCircle } from "lucide-react-native";
// import { AppTheme } from "@/theme/theme";
// import { useStyles } from "@/theme/useStyles";
// import { useAppTheme } from "@/theme/ThemeContext";
// import { ActionButtons } from "../components/ActionButtons";

// interface FeedStatusCardProps {
//   type: "loading" | "error" | "empty";
//   title: string;
//   message: string;
//   onAction?: () => void;
//   actionText?: string;
// }

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// export function FeedStatusCard({
//   type,
//   title,
//   message,
//   onAction,
//   actionText,
// }: FeedStatusCardProps) {
//   const { theme, mode } = useAppTheme();
//   const styles = useStyles(createStyles);
//   if (!theme) return null;
//   return (
//     <View style={styles.card}>
//       <TouchableOpacity activeOpacity={1} style={styles.imageContainer}>
//         <Image
//           source={require("../../../../assets/images/profile.png")}
//           style={styles.image}
//           contentFit={"cover"}
//           cachePolicy="disk"
//           transition={200}
//         />
//       </TouchableOpacity>

//       <View style={styles.cardContent}>
//         <View style={styles.iconContainer}>
//           <View style={styles.iconFit}>
//             {type === "loading" && (
//               <ActivityIndicator size="large" color={theme.colors.primary} />
//             )}
//             {type === "error" && (
//               <AlertCircle size={40} color={theme.colors.danger} />
//             )}
//             {type === "empty" && (
//               <Info size={40} color={theme.colors.primary} />
//             )}
//           </View>
//           <Text style={styles.title}>{title}</Text>
//         </View>
//         <Text style={[styles.message, { color: theme.colors.textLight }]}>
//           {message}
//         </Text>

//         {onAction && (
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: theme.colors.primary }]}
//             onPress={onAction}
//           >
//             <Text style={styles.buttonText}>{actionText}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }

// export const createStyles = (theme: AppTheme) =>
//   StyleSheet.create({
//     card: {
//       position: "absolute",
//       width: screenWidth - 20,
//       height: screenHeight * 0.75,
//       borderRadius: theme.borderRadius.xl,
//       backgroundColor: theme.colors.card,
//       shadowColor: theme.colors.shadow,
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.25,
//       shadowRadius: 10,
//       elevation: 5,
//     },
//     cardContent: {
//       position: "absolute",
//       bottom: 60,
//       left: 0,
//       right: 55,
//       padding: theme.spacing.lg,
//     },
//     content: { alignItems: "center" },
//     iconContainer: { flexDirection: "row" },
//     iconFit: { margin: 10 },
//     imageContainer: {
//       width: "100%",
//       height: "100%",
//       borderRadius: theme.borderRadius.xl,
//     },
//     image: {
//       width: "100%",
//       height: "100%",
//       borderRadius: theme.borderRadius.xl,
//     },
//     title: {
//       fontSize: 22,
//       fontWeight: "bold",
//       textAlign: "center",
//       textAlignVertical: "center",
//       marginBottom: 10,
//       color: theme.colors.text,
//     },
//     message: {
//       fontSize: 16,
//       textAlign: "center",
//       marginBottom: 30,
//       paddingHorizontal: 20,
//     },
//     button: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
//     buttonText: {
//       color: "white",
//       fontWeight: "600",
//       fontSize: 16,
//       textAlign: "center",
//     },

//     actionsContainer: {
//       position: "absolute",
//       right: theme.spacing.lg,
//       bottom: theme.spacing.lg,
//       alignItems: "flex-end",
//       elevation: 10,
//     },
//     rightActions: {
//       alignItems: "center",
//     },
//     dummybutton: {
//       opacity: 0.5,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     previousFeedBtnContainer: {
//       position: "absolute",
//       bottom: 0,
//       left: 0,
//       right: 55,
//       padding: theme.spacing.lg,
//     },
//   });

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
          source={require("../../../../assets/images/profile.png")}
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
