import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Pressable,
  View,
} from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface Props {
  loading: boolean;
  progress: number; // 0 to 100
  success: boolean; // Set to true for 2 seconds after upload finishes
  isEditing: boolean;
  onPress: () => void;
}

export default function UploadButton({
  loading,
  progress,
  success,
  isEditing,
  onPress,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  if (!theme) return null;

  const scaleValue = useRef(new Animated.Value(1)).current;

  // Press animations
  const onPressIn = () =>
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={!isEditing || loading || success}
      style={[
        styles.uploadButton,
        { transform: [{ scale: scaleValue }] },
        // Change color based on State
        {
          backgroundColor: success
            ? theme.colors.success
            : isEditing
              ? theme.colors.primary
              : theme.colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        {success ? (
          // 1. Success State: Lucide Check Icon
          <Animated.View style={styles.row}>
            <CheckCircle2 size={20} color="white" strokeWidth={3} />
            <Text style={styles.buttonText}> Photos Saved</Text>
          </Animated.View>
        ) : loading ? (
          // 2. Loading State: Spinner + Progress %
          <View style={styles.row}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.buttonText}>
              {` Uploading ${Math.round(progress)}%`}
            </Text>
          </View>
        ) : (
          // 3. Idle State
          <Text style={styles.buttonText}>
            {isEditing ? "Save Photos" : "No Changes"}
          </Text>
        )}
      </View>

      {/* 4. Visual Progress Bar Overlay (Very subtle) */}
      {loading && (
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      )}
    </AnimatedPressable>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    uploadButton: {
      height: 56,
      borderRadius: theme.borderRadius.lg,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden", // Important for the progress bar overlay
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    content: {
      zIndex: 2, // Keeps text above the progress bar
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    progressBar: {
      position: "absolute",
      left: 0,
      bottom: 0,
      top: 0,
      backgroundColor: "rgba(255, 255, 255, 0.15)", // Subtle white overlay
      zIndex: 1,
    },
  });
