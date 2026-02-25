import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfileContext } from "../../../context/ProfileContext";
import { fetchReceivedLikesSince } from "../../home/apis/likeApis";
import { Profile } from "../../../types/profile";

// 1. The Strategy
// Source: We take the likedSentIds (the array of UIDs you've liked).
// Search: We scan all feed query pages currently on the disk/in memory.
// Limit: We only pick the latest 20 matched profiles.
// Skip: If a profile isn't in the disk cache, we simply don't show it. This keeps the UI 100% "free."
export function useLikesSentProfilesList(uid: string) {
  const queryClient = useQueryClient();

  // 1. 🔹 Pull the "Official" Liked IDs (Already reactive)
  const likedIds =
    queryClient.getQueryData<string[]>(["likesSentIds", uid]) || [];

  const matchedData = useMemo(() => {
    if (likedIds.length === 0) return [];

    // 2. 🔹 Map ALL profiles from ALL feed shards (Latest, Default, etc.)
    const profilesMap = new Map<string, Profile>();

    // Scan the cache for any query starting with "feed"
    const feedQueries = queryClient.getQueryCache().findAll({
      queryKey: ["feed"], // 🔹 Match any shard like ["feed", "Male"] or ["feed", "Latest"]
      exact: false,
    });

    feedQueries.forEach((query) => {
      const data = query.state.data as any;
      data?.pages?.forEach((page: any) => {
        page.profiles?.forEach((p: Profile) => {
          profilesMap.set(p.uid, p);
        });
      });
    });

    const profilesInCache = Array.from(profilesMap.keys());

    // 3. 🔹 Cross-reference IDs with Disk Cache
    // We reverse likedIds to get the most recent likes first
    const matched: Profile[] = [];
    const reversedIds = [...likedIds].reverse();

    for (const id of reversedIds) {
      if (matched?.length >= 20) break; // ⚡ STOP at 20 (Requirement)

      const cachedProfile = profilesMap.get(id);
      if (cachedProfile) {
        matched.push(cachedProfile);
      }
    }

    return [...likedIds]
      .reverse()
      .slice(0, 20) // Keep only latest 20 as requested
      .map((id) => {
        const p = profilesMap.get(id);
        if (!p) return null;

        return {
          id: p.uid,
          name: p.fullName || "User", // Ensure correct key from Profile
          photo: p.thumbnail || null, // Ensure correct key from Profile
          age: p.dateOfBirth,
          profile: p, // Pass full profile for Details navigation
        };
      })
      .filter((item): item is any => !!item);
  }, [likedIds, uid, queryClient]);

  return {
    data: matchedData,
    isLoading: false,
  };
}

// 1. The Strategy: "The Persistent Delta"
// Sync Logic: We store the lastSyncTimestamp in the TanStack Cache metadata.
// We only fetch likes created after our last successful check.
// Storage Logic: We merge new results with the cache and prune to 50.
// Persistence: We set staleTime: Infinity so it only triggers a "Check for new"
// when we manually tell it to, or upon a fresh app session.

export function useLikesReceivedProfilesList(uid: string, gender: string) {
  const queryClient = useQueryClient();
  const queryKey = ["likesReceivedProfiles", uid, gender];
  const syncKey = ["likesLastSync", uid];

  const query = useQuery<Profile[]>({
    queryKey,
    queryFn: async () => {
      // 1. Get current cached profiles and last sync time from MMKV
      const existing = queryClient.getQueryData<Profile[]>(queryKey) || [];
      const lastSyncData = queryClient.getQueryData(syncKey);
      const lastSync = typeof lastSyncData === "number" ? lastSyncData : 1;

      try {
        // 2. Add '|| []' to the fetch result to prevent 'undefined' crashes
        console.log("fetchReceivedLikesSince params:", uid, lastSync, gender);
        const response = await fetchReceivedLikesSince(uid, lastSync, gender);
        const newProfiles = response || []; // FAIL-SAFE
        console.log("newprofiles:", newProfiles?.length);

        // 3. Early return if nothing new to save CPU/Memory
        if (newProfiles.length === 0) {
          return existing;
        }

        const existingIds = new Set(newProfiles.map((p) => p.uid));
        const merged = [
          ...newProfiles,
          ...existing.filter((p) => !existingIds.has(p.uid)),
        ];

        const pruned = merged.slice(0, 50);

        // 4. Calculate next sync timestamp safely
        const latestTs = Math.max(
          ...newProfiles.map((p) => {
            const ts = (p as any).createdAt;
            // High-end check: Handle Firestore Timestamp vs Date vs Number
            if (!ts) return Date.now();
            return typeof ts === "number" ? ts : ts?.toMillis?.() || Date.now();
          }),
        );

        queryClient.setQueryData(syncKey, latestTs);
        return pruned;
      } catch (error) {
        console.error("Sync Failed:", error);
        // Return existing data so the UI doesn't go blank on network failure
        return existing;
      }
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // Check for new likes at most once per hour
    gcTime: Infinity, // 🔹 Keep in MMKV disk cache forever
  });

  // Maps the raw profiles to the exact UI-ready shape used in Sent Likes
  const transformedData = (query.data || []).map((p) => ({
    id: p.uid,
    name: p.fullName || "User",
    photo: p.thumbnail || null,
    age: p.dateOfBirth,
    profile: p, // Pass full profile for Details navigation
  }));

  return {
    data: transformedData,
    isLoading: query.isLoading,
    //  isRefetching: query.isRefetching,
    //  refetch: query.refetch,
  };
}
