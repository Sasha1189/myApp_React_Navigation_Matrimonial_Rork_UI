import { useMemo } from "react";
import { useFeedDefault } from "./useFeedDefault";
import { useFeedLatest } from "./useFeedLatest";
import { useFeedMatches } from "./useFeedMatches";
import { useFeedSearch } from "./useFeedSearch";
import { storage } from "../../../cache/cacheConfig";
import { FeedHookResult } from "../type/type";
import { useLikesSentIds } from "./useLikesSentIds"; // Your Master List Hook

export function useActiveFeed(uid: string, gender: string): FeedHookResult {
  // 1. Determine Mode & Params from MMKV
  const mode = storage.getString(`active_mode_${uid}`) || "default";
  const searchParams = JSON.parse(
    storage.getString(`active_search_params_${uid}`) || "{}",
  );
  const recoParams = JSON.parse(
    storage.getString(`active_reco_params_${uid}`) || "{}",
  );

  // 2. Initialize all shards (Must be called every render)
  const defaultFeed = useFeedDefault(uid, gender);
  const latestFeed = useFeedLatest(uid, gender);
  const matchesFeed = useFeedMatches(uid, gender, recoParams);
  const searchFeed = useFeedSearch(uid, gender, searchParams);

  // 3. Fetch Master List of Liked IDs (Master Cache)
  const { data: likedIds = [] } = useLikesSentIds(uid);

  // 4. Select the Active Feed based on mode
  const feeds: Record<string, FeedHookResult> = {
    default: defaultFeed,
    latest: latestFeed,
    matches: matchesFeed,
    search: searchFeed,
  };
  const activeFeed = feeds[mode] || feeds.default;

  // 5. 🔹 AGGRESSIVE VIRTUAL MERGE
  // This turns 'likedIds' list into 'liked: true' on the card profiles instantly
  const likedSet = useMemo(() => {
    // 🔹 Robust check: ensures we only pass an array to the Set constructor
    const arrayToUse = Array.isArray(likedIds) ? likedIds : [];
    return new Set(arrayToUse);
  }, [likedIds]);

  const hydratedProfiles = useMemo(() => {
    const baseProfiles = activeFeed.profiles || [];
    return baseProfiles.map((p) => ({
      ...p,
      liked: likedSet.has(p.uid),
    }));
  }, [activeFeed.profiles, likedSet]);

  // 6. Return the unified result to HomeScreen
  return {
    ...activeFeed,
    profiles: hydratedProfiles, // Overwrite with merged data
  };
}
