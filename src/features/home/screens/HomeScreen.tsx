import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  StatusBar,
  Alert,
} from "react-native";
import GenderModal from "../components/GenderModal";
import { useTheme } from "../../../theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../context/AuthContext";
import { useAppNavigation } from "../../../navigation/hooks";
import { performSync } from "../hooks/useSwipeMutations";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { SwipeCard } from "../components/SwipeCard";
import { FeedStatusContent } from "../components/FeedStatusContent";

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
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

  useEffect(() => {
    const syncLikes = async () => {
      try {
        await performSync(uid);
      } catch (error) {
        console.warn("Error syncing likes on HomeScreen mount:", error);
      }
    };
    syncLikes();
  }, [uid]);

  const feed = useActiveFeed(user?.uid!, user?.displayName!);

  console.log("Current Indexx:", feed.currentIndex);

  console.log("Profiles lengthx :", feed.profiles.length);

  const { profiles, currentIndex, updateIndex } = feed;
  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up") {
      // Allow index to reach profiles.length (this triggers the 'Empty/Start Over' card)
      if (currentIndex < profiles.length) {
        updateIndex(currentIndex + 1);
      }
    } else {
      // Standard back logic
      if (currentIndex > 0) {
        updateIndex(currentIndex - 1);
      }
    }
  };

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
          {currentProfile && currentIndex < profiles.length ? (
            <SwipeCard
              uid={uid}
              key={currentProfile.uid}
              profile={currentProfile}
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

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    cardsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
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
