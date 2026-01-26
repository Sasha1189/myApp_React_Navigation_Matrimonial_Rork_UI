import { ActionButtons } from "../components/ActionButtons";
import { SwipeCard } from "../components/SwipeCard";
import { useTheme } from "../../../theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, StatusBar } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useToggleLike } from "../hooks/useSwipeMutations";
import { useAppNavigation } from "../../../navigation/hooks";
import GenderModal from "../components/GenderModal";
import { useFlattenedFeed } from "../hooks/useFlattenedFeed";
import { FeedLoading, FeedError, FeedEmpty } from "../components/FeedStates";

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const uid = user?.uid as string;
  const gender =
    user?.displayName === "Male" || user?.displayName === "Female"
      ? user.displayName
      : undefined;
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

  // fetch feed
  const {
    profiles,
    feedDone,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    resetFeed,
  } = useFlattenedFeed(uid, gender);

  // mutations
  const toggleLikeMutation = useToggleLike();

  // UI states
  if (isLoading) return <FeedLoading />;
  if (isError) return <FeedError error={error} onRetry={refetch} />;
  if (profiles?.length === 0 && feedDone)
    return (
      <FeedEmpty
        feedDone={feedDone}
        onReload={() => {
          if (feedDone) {
            resetFeed();
            // navigation.navigate("Profile");
          } else if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
      />
    );

  // handle swipe actions
  const handleSwipe = (id: string, action: "like" | "pass" | "superlike") => {
    if (action === "like") {
      toggleLikeMutation.mutate({ profileId: id, uid });
    }
    if (action === "pass")
      navigation.navigate("Details", { profile: currentProfile });
    if (action === "superlike")
      navigation.navigate("Chat", { otherUserId: id });

    // prefetch when few left...use later
    // if (
    //   profiles.length < 5 &&
    //   hasNextPage &&
    //   !isFetchingNextPage &&
    //   !feedDone
    // ) {
    //   fetchNextPage();
    // }
  };

  const currentProfile = profiles[0];
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
          {currentProfile && (
            <SwipeCard
              profile={currentProfile}
              isTopCard={true}
              onSwipeLeft={() =>
                currentProfile && handleSwipe(currentProfile.uid, "pass")
              }
              onSwipeRight={() =>
                currentProfile && handleSwipe(currentProfile.uid, "like")
              }
              onSwipeUp={() =>
                currentProfile && handleSwipe(currentProfile.uid, "superlike")
              }
            />
          )}
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.rightActions}>
            {/* Disable action buttons when a swipe mutation is in-flight to avoid duplicates */}
            <ActionButtons
              onPass={() =>
                currentProfile && handleSwipe(currentProfile.uid, "pass")
              }
              onLike={() =>
                currentProfile && handleSwipe(currentProfile.uid, "like")
              }
              onSuperLike={() =>
                currentProfile && handleSwipe(currentProfile.uid, "superlike")
              }
              disabled={
                !currentProfile || toggleLikeMutation.status === "pending"
                // passMutation.status === "pending" ||
                // superLikeMutation.status === "pending"
              }
              liked={currentProfile?.liked}
            />
          </View>
        </View>
        {isFetchingNextPage && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
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
