import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { appStorage } from "@/cacheMMKV/cacheConfig";
import { FeedCache, FeedMode } from "../cache/feedCache";
import { useDefaultFeed } from "./useDefaultFeed";
import { useLatestFeed } from "./useLatestFeed";
import { useSearchFeed } from "./useSearchFeed";
import { useFilterFeed } from "./useFilterFeed";
import { useBlockedSet } from "@/features/block/hook/useBlockedSet";

export function useActiveFeed(uid: string) {
  // Track component render frequency
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[useActiveFeed] Render #${renderCount.current}`);

  // Read initial cache values directly on mount
  const [mode, setMode] = useState<FeedMode>(
    () => FeedCache.getMode(uid) || "default",
  );
  const [searchQuery, setSearchQuery] = useState(() =>
    FeedCache.getSearchQuery(uid),
  );
  const [filterParams, setFilterParams] = useState(() =>
    FeedCache.getFilterParams(uid),
  );

  const blockedSet = useBlockedSet();

  // Listen to MMKV updates for active mode, search queries, and filter parameters
  useEffect(() => {
    if (!uid) {
      console.log("[useActiveFeed] No UID provided, listener skipped.");
      return;
    }

    const keys = FeedCache.getKeys(uid);

    const listener = appStorage.addOnValueChangedListener((key) => {
      console.log(`[useActiveFeed] MMKV key changed: ${key}`);
      if (key === keys.mode) {
        const newMode = FeedCache.getMode(uid);
        console.log(`[useActiveFeed] Mode updated -> ${newMode}`);
        setMode(newMode);
      }
      if (key === keys.searchQuery) {
        const newQuery = FeedCache.getSearchQuery(uid);
        console.log(`[useActiveFeed] SearchQuery updated -> ${newQuery}`);
        setSearchQuery(newQuery);
      }
      if (key === keys.filterParams) {
        const newParams = FeedCache.getFilterParams(uid);
        console.log(`[useActiveFeed] FilterParams updated`, newParams);
        setFilterParams(newParams);
      }
    });

    return () => listener.remove();
  }, [uid]);

  // Sub-hooks executed conditionally based on active mode
  const defaultFeed = useDefaultFeed(uid, mode === "default");
  const latestFeed = useLatestFeed(uid, mode === "latest");
  const searchFeed = useSearchFeed(uid, mode === "search", searchQuery);
  const filterFeed = useFilterFeed(uid, mode === "filter", filterParams);

  const activeFeed = useMemo(() => {
    console.log(`[useActiveFeed] Active feed computed for mode: ${mode}`);
    switch (mode) {
      case "search":
        return searchFeed;
      case "latest":
        return latestFeed;
      case "filter":
        return filterFeed;
      default:
        return defaultFeed;
    }
  }, [mode, defaultFeed, latestFeed, searchFeed, filterFeed]);

  const visibleProfiles = useMemo(() => {
    const rawProfiles = activeFeed.profiles || [];
    if (blockedSet.size === 0) return rawProfiles; // O(1) direct pass-through
    return rawProfiles.filter((profile) => !blockedSet.has(profile.uid));
  }, [activeFeed.profiles, blockedSet]);

  return {
    ...activeFeed,
    profiles: visibleProfiles,
    isLoading: Boolean(activeFeed.isLoading),
    error: activeFeed.error || null,
    mode,
  };
}
