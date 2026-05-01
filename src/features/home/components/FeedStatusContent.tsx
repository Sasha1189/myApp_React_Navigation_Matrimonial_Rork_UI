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
    resetFeed,
    refetch,
    updateIndex,
    mode = "default",
  } = feed;
  const { t } = useTranslation();

  //new user
  if (profiles?.length === 0 && !isLoading && !isError) {
    return (
      <FeedStatusCard
        type="empty"
        title={t("feed.newTitle")}
        message={t("feed.newMessage")}
      />
    );
  }

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
  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <>
        <FeedStatusCard
          type="empty"
          title={t(`feed.endTitle_${mode}`, {
            defaultValue: t("feed.endTitle"),
          })}
          message={t(`feed.endMessage_${mode}`, {
            defaultValue: t("feed.endMessage"),
          })}
          onAction={resetFeed}
          actionText={t(`feed.action_${mode}`, {
            defaultValue: t("feed.startOver"),
          })}
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
