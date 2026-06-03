import { useState, useEffect, useMemo, useCallback } from "react";
import { useFeedDefault } from "./useFeedDefault";
import { useFeedLatest } from "./useFeedLatest";
import { useFeedSearch } from "./useFeedSearch";
import { useFeedFilter } from "./useFeedFilter";
import { useLikeBlockCache } from "./useLikeBlockCache";
import { storage } from "../../../cache/cacheConfig";
import { FeedHookResult } from "../type/type";

export function useActiveFeed(uid: string): FeedHookResult {
  const [mode, setMode] = useState(
    () => storage.getString(`active_mode_${uid}`) || "default",
  );
  const [searchField, setSearchField] = useState(
    () => storage.getString(`search_field_${uid}`) || "name",
  );
  const [searchQuery, setSearchQuery] = useState(
    () => storage.getString(`search_query_${uid}`) || "",
  );
  const [filterParams, setFilterParams] = useState(() => {
    const saved = storage.getString(`active_filter_params_${uid}`);
    return saved ? JSON.parse(saved) : null;
  });

  // 2. The Storage "Watcher"
  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === `active_mode_${uid}`) {
        setMode(storage.getString(key) || "default");
      }
      if (key === `search_field_${uid}`) {
        setSearchField(storage.getString(key) || "name");
      }
      if (key === `search_query_${uid}`) {
        setSearchQuery(storage.getString(key) || "");
      }
      // 🔹 Watch for Filter changes
      if (key === `active_filter_params_${uid}`) {
        const saved = storage.getString(key);
        setFilterParams(saved ? JSON.parse(saved) : null);
      }
    });
    return () => listener.remove();
  }, [uid]);

  console.log("useActivefeed:", mode, searchField, searchQuery, filterParams);

  // 3. Initialize Shards (Clean & Reactive)
  const defaultFeed = useFeedDefault(uid, mode === "default");
  const latestFeed = useFeedLatest(uid, mode === "latest");
  const searchFeed = useFeedSearch(
    uid,
    mode === "search",
    searchField,
    searchQuery,
  );
  const filterFeed = useFeedFilter(uid, mode === "filter", filterParams);

  // 4. Selection & Merge Logic (Rest of your existing code...)
  const activeFeed = useMemo(() => {
    if (mode === "search") return searchFeed;
    if (mode === "latest") return latestFeed;
    if (mode === "filter") return filterFeed;
    return defaultFeed;
  }, [mode, filterFeed, searchFeed, latestFeed, defaultFeed]);

  // 5. Get the reactive likes/blocks
  const { likedSet, blockedSet } = useLikeBlockCache();

  // 6. Merge Logic
  const finalProfiles = useMemo(() => {
    const raw = activeFeed.profiles || [];
    if (!raw?.length) return [];

    return raw
      .filter((p: any) => p?.uid && !blockedSet.has(p.uid))
      .map((p: any) => ({
        ...p,
        liked: likedSet.has(p.uid),
      }));
  }, [activeFeed.profiles, likedSet, blockedSet]);

  const updateIndex = useCallback(
    (val: number) => {
      activeFeed.updateIndex(val);
    },
    [activeFeed],
  );

  return {
    ...activeFeed,
    profiles: finalProfiles,
    resetFeed: activeFeed.resetFeed,
    refetch: activeFeed.refetch,
    updateIndex,
    isLoading: activeFeed.isLoading,
    mode,
  };
}
