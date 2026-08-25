import { useState, useEffect, useMemo, useRef } from "react";
import { appStorage } from "@/cacheMMKV/cacheConfig";
import { FeedCache, FeedMode } from "../cache/feedCache";
import { Profile } from "@/features/profile/types/profile";
import { useDefaultFeed } from "./useDefaultFeed";
import { useLatestFeed } from "./useLatestFeed";
import { useSearchFeed } from "./useSearchFeed";
import { useFilterFeed } from "./useFilterFeed";
import { useLikedSet } from "@/features/likes/hook/useLikedSet";
import { useBlockedSet } from "@/features/block/hook/useBlockedSet";

export function useActiveFeed(uid: string) {
  // 🔍 LOG 1: Track component render frequency......................
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[useActiveFeed] Render #${renderCount.current} | uid: "${uid}"`);
  //............................................
  const [mode, setMode] = useState<FeedMode>("default");
  const [searchQuery, setSearchQuery] = useState(() =>
    FeedCache.getSearchQuery(uid),
  );
  const [filterParams, setFilterParams] = useState(() =>
    FeedCache.getFilterParams(uid),
  );

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
        setMode(FeedCache.getMode(uid));
      }
      if (key === keys.searchQuery) {
        const newQuery = FeedCache.getSearchQuery(uid);
        console.log(`[useActiveFeed] SearchQuery updated -> ${newQuery}`);
        setSearchQuery(FeedCache.getSearchQuery(uid));
      }
      if (key === keys.filterParams) {
        const newParams = FeedCache.getFilterParams(uid);
        console.log(`[useActiveFeed] FilterParams updated`, newParams);
        setFilterParams(FeedCache.getFilterParams(uid));
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

  const likedSet = useLikedSet();
  const blockedSet = useBlockedSet();

  // Exclude blocked users and annotate liked state in real-time
  const finalProfiles = useMemo(() => {
    const raw = activeFeed.profiles || [];
    console.log(
      `[useActiveFeed] Computing finalProfiles (raw count: ${raw.length})`,
    );
    if (!raw.length) return [];

    return raw
      .filter((p: Profile) => p?.uid && !blockedSet.has(p.uid))
      .map((p: Profile) => ({
        ...p,
        liked: likedSet.has(p.uid),
      }));
  }, [activeFeed.profiles, likedSet, blockedSet]);

  return {
    ...activeFeed,
    profiles: finalProfiles,
    isLoading: Boolean(activeFeed.isLoading),
    error: activeFeed.error || null,
    mode,
  };
}
