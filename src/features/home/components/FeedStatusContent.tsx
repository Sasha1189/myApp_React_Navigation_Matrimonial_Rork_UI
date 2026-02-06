import { FeedStatusCard, FeedPreviousProfiles } from "./FeedStatusCard";
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
    updateIndex,
  } = feed;

  // 1. Error Card
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

  // 2. 🔹 CHECK END OF FEED FIRST
  // If we have profiles but swiped past the last one, OR we have 0 profiles and backend is done
  if (
    (profiles.length > 0 && currentIndex >= profiles.length) ||
    (profiles.length === 0 && feedDone)
  ) {
    return (
      <>
        <FeedStatusCard
          type="empty"
          title="End of the line"
          message="You've swiped through everyone"
          onAction={resetFeed}
          actionText="Start Over"
        />
        {currentIndex > 0 && (
          <FeedPreviousProfiles
            currentIndex={currentIndex}
            updateIndex={updateIndex}
          />
        )}
      </>
    );
  }

  // 3. Initial Loading state
  if (isLoading && profiles.length === 0) {
    return (
      <FeedStatusCard
        type="loading"
        title="Loading..."
        message="Loading profiles for you..."
      />
    );
  }

  // 4. Default Fallback (should not be reached if boundaries are tight)
  return (
    <FeedStatusCard
      type="empty"
      title={"No profiles found"}
      message={"Try adjusting your filters to see more people."}
      onAction={resetFeed}
      actionText={"Reload Feed"}
    />
  );
}
