import { useState, useEffect, useMemo } from "react";
import { storage } from "@/cache/cacheConfig";
import { useDatabase } from "@/context/DatabaseContext";
import { Profile } from "@/types/profile";
import { useFeedDefault } from "./useFeedDefault";
import { useFeedLatest } from "./useFeedLatest";
import { useFeedSearch } from "./useFeedSearch";
import { useFeedFilter } from "./useFeedFilter";
import { useLikeBlockCache } from "./useLikeBlockCache";

/** Helper to safely parse JSON from storage */
function parseFilterParams(
  raw: string | undefined,
): Record<string, any> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useActiveFeed(uid: string) {
  // 1. Consume Database Context
  const { isDbReady, migrationError } = useDatabase();

  const [mode, setMode] = useState(
    () => storage.getString(`active_mode_${uid}`) || "default",
  );
  const [searchQuery, setSearchQuery] = useState(
    () => storage.getString(`search_query_${uid}`) || "",
  );
  const [filterParams, setFilterParams] = useState(() =>
    parseFilterParams(storage.getString(`active_filter_params_${uid}`)),
  );

  // 2. Listen to MMKV storage updates for mode/search/filter changes
  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === `active_mode_${uid}`) {
        setMode(storage.getString(key) || "default");
      }
      if (key === `search_query_${uid}`) {
        setSearchQuery(storage.getString(key) || "");
      }
      if (key === `active_filter_params_${uid}`) {
        setFilterParams(parseFilterParams(storage.getString(key)));
      }
    });

    return () => listener.remove();
  }, [uid]);

  // 3. Gate sub-hooks with `isDbReady && mode === "..."` to prevent redundant queries
  const defaultFeed = useFeedDefault(uid, isDbReady && mode === "default");
  const latestFeed = useFeedLatest(uid, isDbReady && mode === "latest");
  const searchFeed = useFeedSearch(
    uid,
    isDbReady && mode === "search",
    searchQuery,
  );
  const filterFeed = useFeedFilter(
    uid,
    isDbReady && mode === "filter",
    filterParams,
  );

  // 4. Select active feed sub-hook
  const activeFeed = useMemo(() => {
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

  const { likedSet, blockedSet } = useLikeBlockCache();

  // 5. Exclude blocked profiles and attach dynamic `liked` state
  const finalProfiles = useMemo(() => {
    const raw = activeFeed.profiles || [];
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
    isLoading: !isDbReady || Boolean(activeFeed.isLoading),
    error: migrationError || activeFeed.error || null,
    isDbReady,
    mode,
  };
}
