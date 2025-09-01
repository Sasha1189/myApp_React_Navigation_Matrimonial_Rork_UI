import { ActionButtons } from "../../../components/ActionButtons";
import { SwipeCard } from "../../../components/SwipeCard";
import { useTheme } from "../../../theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { useFeed } from "../hooks/useFeed";
import {
  useLikeProfile,
  usePassProfile,
  useSuperLikeProfile,
} from "../hooks/useSwipeMutations";
import { useTabNavigation } from "../../../navigation/hooks";
import GenderModal from "../../../components/Modal";

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
  const navigation = useTabNavigation();

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

  //Hooks import and data feeding
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(uid, gender);
  const likeMutation = useLikeProfile();
  const passMutation = usePassProfile();
  const superLikeMutation = useSuperLikeProfile();

  // Flatten paginated pages into one array
  const profiles = useMemo(
    () => data?.pages?.flatMap((page) => page.items) ?? [],
    [data]
  );

  // derive server-side 'done' flag from last page
  const lastPage =
    data && data.pages && data.pages.length > 0
      ? data.pages[data.pages.length - 1]
      : undefined;
  const feedDone = !!lastPage?.done;

  // centralized thresholds for prefetching / auto-loading
  const AUTO_LOAD_THRESHOLD = 3; // when to auto-load next page in background
  const PREFETCH_THRESHOLD = 5; // when to eagerly prefetch after a swipe
  const isAutoLoadLow =
    profiles.length > 0 && profiles.length <= AUTO_LOAD_THRESHOLD;
  const isPrefetchLow =
    profiles.length > 0 && profiles.length < PREFETCH_THRESHOLD;

  // Always watch the remaining profiles length
  useEffect(() => {
    if (isAutoLoadLow && hasNextPage && !isFetchingNextPage && !feedDone) {
      fetchNextPage();
    }
  }, [profiles, hasNextPage, fetchNextPage, isFetchingNextPage, feedDone]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <LinearGradient
        colors={[theme.colors.background, "white"]}
        style={styles.container}
      >
        <EmptyState
          title="Failed to load"
          subtitle={error?.message ?? "Something went wrong"}
          buttonText="Retry"
          onButtonPress={() => refetch()}
        />
      </LinearGradient>
    );
  }

  // if (!profiles.length) {
  //   return (
  //     <LinearGradient
  //       colors={[theme.colors.background, "white"]}
  //       style={styles.container}
  //     >
  //       <EmptyState
  //         title={feedDone ? "You've seen all matches" : "No more profiles!"}
  //         subtitle={
  //           feedDone
  //             ? "You've reviewed all available profiles for now. Check back later or update your preferences."
  //             : "Check back later for more matches"
  //         }
  //         buttonText={feedDone ? "OK" : "Reload"}
  //         onButtonPress={() => {
  //           if (feedDone) {
  //             // If feed is finished, avoid a blind reload. Send user to Profile to update preferences.
  //             navigation.navigate("Profile");
  //             return;
  //           }

  //           // Otherwise attempt to fetch the next page if available.
  //           if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  //         }}
  //       />
  //     </LinearGradient>
  //   );
  // }

  const handleSwipe = (uid: string, action: "like" | "pass" | "superlike") => {
    if (action === "like") likeMutation.mutate(uid);
    if (action === "pass") passMutation.mutate(uid);
    if (action === "superlike") superLikeMutation.mutate(uid);

    // Prefetch next batch early when few left. Respect server `done` flag.
    if (isPrefetchLow && hasNextPage && !isFetchingNextPage && !feedDone) {
      fetchNextPage();
    }
  };

  const currentProfile = profiles[0];
  return (
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
              !currentProfile ||
              likeMutation.status === "pending" ||
              passMutation.status === "pending" ||
              superLikeMutation.status === "pending"
            }
          />
        </View>
      </View>
      {isFetchingNextPage && (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      )}
    </LinearGradient>
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
