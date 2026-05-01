import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Button,
  View,
  StatusBar,
  Alert,
} from "react-native";
import GenderModal from "../components/GenderModal";

import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../context/AuthContext";
import { useAppNavigation } from "../../../navigation/hooks";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { SwipeCard } from "../components/SwipeCard";
import { FeedStatusContent } from "../components/FeedStatusContent";
import { useTranslation } from "react-i18next";
import { FeedStatusCard } from "../components/FeedStatusCard";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  const { user } = useAuth();
  const uid = user?.uid as string;
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigation = useAppNavigation();

  useEffect(() => {
    if (
      user &&
      user?.displayName !== "Male" &&
      user?.displayName !== "Female"
    ) {
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (showModal) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation, showModal]);

  const feed = useActiveFeed(uid!);

  console.log("Current Index:", feed.currentIndex);

  console.log("Profiles length:", feed.profiles.length);

  const { profiles, currentIndex, updateIndex, isLoading } = feed;

  // const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const nextImageUrl = nextProfile?.photos?.[0]?.downloadURL || null;

  if (isLoading && profiles.length === 0) {
    return (
      <FeedStatusCard
        type="loading"
        title={t("feed.loadingTitle")}
        message={t("feed.loadingMessage")}
      />
    );
  }

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up") {
      // Allows index to reach profiles.length to show the "Start Over" card
      if (currentIndex < profiles.length) {
        updateIndex(currentIndex + 1);
      }
    } else if (direction === "down") {
      // 🔹 Case 1 Fix: Block index -1. Only decrement if we're past the first card.
      if (currentIndex > 0) {
        updateIndex(currentIndex - 1);
      } else {
        // 🔹 Re-trigger the card's local reset animation to prevent a blank state
        console.log("Already at first card, resetting position.");
      }
    }
  };
  if (!theme) return null;
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <LinearGradient
        colors={[theme.colors.background, "white"]}
        style={styles.container}
      >
        <GenderModal visible={showModal} onClose={() => setShowModal(false)} />
        <View style={styles.cardsContainer}>
          {profiles[currentIndex] && currentIndex < profiles.length ? (
            <SwipeCard
              uid={uid}
              key={profiles[currentIndex].uid}
              profile={profiles[currentIndex]}
              currentIndex={currentIndex}
              nextImageUrl={nextImageUrl}
              onSwipeUp={() => handleSwipe("up")}
              onSwipeDown={() => handleSwipe("down")}
              isTopCard={true}
            />
          ) : (
            <FeedStatusContent feed={feed} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    cardsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xl,
    },
    noMoreText: {
      fontSize: theme.fontSize.xl,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    noMoreSubtext: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.xl,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.round,
    },
    resetButtonText: {
      color: "white",
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      marginLeft: theme.spacing.sm,
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
    infoButton: {
      backgroundColor: "white",
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
  });
