import { useState, useEffect, useMemo, useRef } from "react";
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

  // 1. Initial MMKV state hydration
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

  // 2. Targeted MMKV Listener Guard
  useEffect(() => {
    if (!uid) return;

    const keys = FeedCache.getKeys(uid);
    const trackedKeys = new Set([
      keys.mode,
      keys.searchQuery,
      keys.filterParams,
    ]);

    const listener = appStorage.addOnValueChangedListener((key) => {
      if (!trackedKeys.has(key)) return;

      console.log(`[useActiveFeed] Relevant MMKV key changed: ${key}`);
      if (key === keys.mode) {
        setMode(FeedCache.getMode(uid) || "default");
      } else if (key === keys.searchQuery) {
        setSearchQuery(FeedCache.getSearchQuery(uid));
      } else if (key === keys.filterParams) {
        setFilterParams(FeedCache.getFilterParams(uid));
      }
    });

    return () => listener.remove();
  }, [uid]);

  // 3. Sub-hooks (ensure sub-hooks return STABLE_EMPTY_FEED when enabled is false)
  const defaultFeed = useDefaultFeed(uid, mode === "default");
  const latestFeed = useLatestFeed(uid, mode === "latest");
  const searchFeed = useSearchFeed(uid, mode === "search", searchQuery);
  const filterFeed = useFilterFeed(uid, mode === "filter", filterParams);

  // 4. Resolve active feed based directly on mode
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

  // 5. O(1) Block filtering with memoized outputs
  const visibleProfiles = useMemo(() => {
    const rawProfiles = activeFeed.profiles || [];
    if (!blockedSet || blockedSet.size === 0) return rawProfiles;
    return rawProfiles.filter((profile) => !blockedSet.has(profile.uid));
  }, [activeFeed.profiles, blockedSet]);

  console.log(
    `[useActiveFeed] Returning feed with ${visibleProfiles.length} visible profiles (mode: ${mode})`,
  );

  return useMemo(
    () => ({
      ...activeFeed,
      profiles: visibleProfiles,
      isLoading: Boolean(activeFeed.isLoading),
      error: activeFeed.error || null,
      mode,
    }),
    [activeFeed, visibleProfiles, mode],
  );
}
