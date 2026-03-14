import { FeedStatusCard, FeedPreviousProfiles } from "./FeedStatusCard";
import { FeedHookResult } from "../type/type";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // 1. Error Card
  if (isError) {
    return (
      <FeedStatusCard
        type="error"
        title={t("feed.errorTitle")}
        message={error?.message || t("feed.errorMessage")}
        onAction={refetch}
        actionText={t("feed.retry")}
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
          title={t("feed.endTitle")}
          message={t("feed.endMessage")}
          onAction={resetFeed}
          actionText={t("feed.startOver")}
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
        title={t("feed.loadingTitle")}
        message={t("feed.loadingMessage")}
      />
    );
  }

  // 4. Default Fallback (should not be reached if boundaries are tight)
  return (
    <FeedStatusCard
      type="empty"
      title={t("feed.emptyTitle")}
      message={t("feed.emptyMessage")}
      onAction={resetFeed}
      actionText={t("feed.reload")}
    />
  );
}
