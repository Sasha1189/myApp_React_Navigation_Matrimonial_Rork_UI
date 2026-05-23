import React from "react";
import { FeedStatusCard } from "./FeedStatusCard";
import { FeedHookResult } from "../type/type";
import { useTranslation } from "react-i18next";

interface FeedStatusContentProps {
  feed: FeedHookResult;
  isFooter?: boolean;
  itemSize: number;
}

export function FeedStatusContent({
  feed,
  isFooter = false,
  itemSize,
}: FeedStatusContentProps) {
  const {
    profiles,
    isLoading,
    isError,
    error,
    resetFeed,
    refetch,
    mode = "default",
  } = feed;
  const { t } = useTranslation();

  // 1. GLOBAL ERROR STATE (Network drops, Server failures)
  if (isError) {
    return (
      <FeedStatusCard
        type="error"
        title={t("feed.errorTitle")}
        message={error?.message || t("feed.errorMessage")}
        onAction={refetch}
        actionText={t("feed.retry")}
        itemSize={itemSize}
      />
    );
  }

  // 2. ZERO RESULTS STATE (Filters too strict, Search returned 0 rows)
  if (profiles?.length === 0 && !isLoading) {
    const isSearchMode = mode === "search" || mode === "filter";

    return (
      <FeedStatusCard
        type="empty"
        title={isSearchMode ? t("feed.noResultsTitle") : t("feed.newTitle")}
        message={
          isSearchMode ? t("feed.noResultsMessage") : t("feed.newMessage")
        }
        onAction={resetFeed}
        actionText={isSearchMode ? t("feed.clearFilters") : t("feed.reload")}
        itemSize={itemSize}
      />
    );
  }

  // 3. SCROLLED TO END STATE (FlatList Footer mount block)
  if (profiles && profiles.length > 0 && isFooter) {
    return (
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
        itemSize={itemSize}
      />
    );
  }

  // 4. Fallback Default Guard (Hides footer when user is still swiping earlier cards)
  return null;
}
