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
    isLoading,
    isError,
    error,
    resetFeed,
    refetch,
    mode = "default",
  } = feed;
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  // 1. FETCH REAL-TIME AUTH CONTEXT TIERS FOR PROTECTION
  const { tier } = useAuth();
  const isRestricted = tier === "none";

  // 2. TRIAL USER PAYWALL INTERCEPTOR (Triggers on total empty state OR scroll-to-end footer mount)
  if ((profiles?.length === 0 || isFooter) && isRestricted) {
    return (
      <FeedStatusCard
        type="empty"
        title={t("feed.upgradeTitle", { defaultValue: "Upgrade Required" })}
        message={t("feed.upgradeMessage", {
          defaultValue:
            "You have viewed all your free profiles for today. Subscribe to premium for unlimited matching!",
        })}
        // Redirects straight to your Paywall checkout navigator stack lane
        onAction={() => navigation.navigate("Paywall")}
        actionText={t("feed.upgradeAction", { defaultValue: "Subscribe Now" })}
        itemSize={itemSize}
      />
    );
  }

  // 3. GLOBAL ERROR STATE (Network drops, Server failures) - Paid Tiers
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

  // 4. ZERO RESULTS STATE (Filters too strict, Search returned 0 rows) - Paid Tiers
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

  // 5. SCROLLED TO END STATE (FlatList Footer mount block) - Paid Tiers
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

  // 6. Fallback Default Guard (Hides footer when user is still swiping earlier cards)
  return null;
}
