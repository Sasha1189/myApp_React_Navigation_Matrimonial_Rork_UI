import { FeedStatusCard } from "./FeedStatusCard";
import { FeedHookResult } from "../type/type";

export function FeedStatusContent({ feed }: { feed: FeedHookResult }) {
  const {
    profiles,
    currentIndex,
    isLoading,
    isError,
    error,
    feedDone,
    resetFeed,
    refetch,
  } = feed;

  const currentProfile = profiles[currentIndex];

  // 1. Loading Card
  if (isLoading && profiles.length === 0) {
    return (
      <FeedStatusCard
        type="loading"
        title="Loading..."
        message="Loading profiles for you..."
      />
    );
  }

  // 2. Error Card
  if (isError) {
    return (
      <FeedStatusCard
        type="error"
        title="Oops!"
        message={error?.message || "Something went wrong"}
        onAction={refetch}
        actionText="Retry"
      />
    );
  }

  // 3. Empty/Done Card
  if (!currentProfile) {
    return (
      <FeedStatusCard
        type="empty"
        title={feedDone ? "End of the line" : "No profiles found"}
        message={
          feedDone
            ? "You've swiped through everyone nearby."
            : "Try adjusting your filters to see more people."
        }
        onAction={resetFeed}
        actionText={feedDone ? "Start Over" : "Reload Feed"}
      />
    );
  }
}
