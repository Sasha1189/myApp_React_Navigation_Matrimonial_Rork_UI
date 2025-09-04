import React, { useEffect, useMemo } from "react";
import { useTheme } from "src/theme";
import { View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { EmptyState } from "src/components/EmptyState";

function FeedLoading() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

function FeedError({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={[theme.colors.background, "white"]}
      style={{ flex: 1 }}
    >
      <EmptyState
        title="Failed to load"
        subtitle={error?.message ?? "Something went wrong"}
        buttonText="Retry"
        onButtonPress={onRetry}
      />
    </LinearGradient>
  );
}

function FeedEmpty({
  feedDone,
  onReload,
}: {
  feedDone: boolean;
  onReload: () => void;
}) {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={[theme.colors.background, "white"]}
      style={{ flex: 1 }}
    >
      <EmptyState
        title={feedDone ? "You've seen all matches" : "No more profiles!"}
        subtitle={
          feedDone
            ? "You've reviewed all available profiles for now. Check back later or update your preferences."
            : "Check back later for more matches"
        }
        buttonText={feedDone ? "OK" : "Reload"}
        onButtonPress={onReload}
      />
    </LinearGradient>
  );
}
export { FeedLoading, FeedError, FeedEmpty };
