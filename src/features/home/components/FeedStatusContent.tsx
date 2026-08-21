import React from "react";
import { FeedStatusCard } from "./FeedStatusCard";
import { FeedHookResult } from "../type/type";
import { useTranslation } from "react-i18next";
import { useAppNavigation } from "../../../navigation/hooks";
import { useAuth } from "../../../context/AuthContext";

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
    currentIndex = 0,
    isLoading,
    isLoadingMore,
    hasMore,
    isError,
    error,
    resetFeed,
    refetch,
    mode = "default",
  } = feed;

  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { tier } = useAuth();

  const isRestricted = tier === "none";
  const isAtLastCard =
    profiles && profiles.length > 0 && currentIndex >= profiles.length - 1;

  // 1. Zero Search/Filter/Feed Results
  if (profiles?.length === 0 && !isLoading) {
    const isSearchMode = mode === "search" || mode === "filter";
    console.log(
      `[FeedStatus] Showing Zero Results Card (mode: ${mode}, isSearchMode: ${isSearchMode})`,
    );

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

  // 2. Paywall interceptor for restricted users (only when on empty feed or reached the end)
  if (
    !isLoading &&
    isRestricted &&
    (profiles?.length === 0 || (isFooter && isAtLastCard))
  ) {
    console.log("[FeedStatus] Showing Paywall Interceptor");
    return (
      <FeedStatusCard
        type="empty"
        title={t("feed.upgradeTitle", { defaultValue: "Upgrade Required" })}
        message={t("feed.upgradeMessage", {
          defaultValue:
            "You have viewed all your free profiles for today. Subscribe to premium for unlimited matching!",
        })}
        onAction={() => navigation.navigate("Paywall")}
        actionText={t("feed.upgradeAction", { defaultValue: "Subscribe Now" })}
        itemSize={itemSize}
      />
    );
  }

  // 3. Network or Server Errors
  if (isError) {
    console.log(`[FeedStatus] Showing Error State: ${error?.message}`);
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

  // 4. Footer Loading Indicator (when fetching next page)
  if (isFooter && isLoadingMore) {
    console.log("[FeedStatus] Showing Footer Loading Indicator");
    return (
      <FeedStatusCard
        type="loading"
        title={t("feed.loadingMoreTitle", {
          defaultValue: "Loading profiles...",
        })}
        message={t("feed.loadingMoreMessage", {
          defaultValue: "Fetching more matches for you.",
        })}
        itemSize={itemSize}
      />
    );
  }

  // 5. Scrolled to End of Queue (ONLY when not loading, hasMore is false, AND user is on the last card)
  if (isFooter && !isLoading && !isLoadingMore && !hasMore && isAtLastCard) {
    console.log(`[FeedStatus] Showing Footer End-of-Feed Card (mode: ${mode})`);
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

  return null;
}
