import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReceivedLikesSince } from "../../home/apis/likeApis";
import { Profile } from "../../../types/profile";
import { formatDOB } from "src/utils/dateUtils";

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
    console.log("IDs currently in Feed Cache:", profilesInCache);

    // 3. 🔹 Cross-reference IDs with Disk Cache
    // We reverse likedIds to get the most recent likes first
    const matched: Profile[] = [];
    const reversedIds = [...likedIds].reverse();

    for (const id of reversedIds) {
      if (matched.length >= 20) break; // ⚡ STOP at 20 (Requirement)

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
          age: p.dateOfBirth ? formatDOB(p.dateOfBirth) : "18+",
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

  return useQuery<Profile[]>({
    queryKey,
    queryFn: async () => {
      // 1. Get current cached profiles and last sync time from MMKV
      const existing = queryClient.getQueryData<Profile[]>(queryKey) || [];
      const lastSync = queryClient.getQueryData<number>(syncKey) || 0;

      console.log(
        `📡 Checking for new likes since: ${new Date(lastSync).toISOString()}`,
      );

      // 2. Fetch only LIKES created after our last sync
      // If lastSync is 0, it will fetch the latest batch (initial load)
      const newProfiles = await fetchReceivedLikesSince(uid, lastSync, gender);
      // 3. Merge: Newest at the top
      const existingIds = new Set(newProfiles.map((p) => p.uid));
      const merged = [
        ...newProfiles,
        ...existing.filter((p) => !existingIds.has(p.uid)),
      ];

      // 4. 🔹 THE PRUNE: Keep latest 50 forever
      const pruned = merged.slice(0, 50);

      // 5. 🔹 UPDATE SYNC TIME: Use the 'ts' of the newest profile or current time
      const nextSync =
        newProfiles.length > 0
          ? Math.max(
              ...newProfiles.map((p) => {
                // Handle both Firestore Timestamp objects and numeric ms
                const ts = (p as any).createdAt;
                return typeof ts === "number"
                  ? ts
                  : ts?.toMillis?.() || Date.now();
              }),
            )
          : lastSync === 0
            ? Date.now()
            : lastSync;
      queryClient.setQueryData(syncKey, nextSync);

      return pruned;
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 60, // Check for new likes at most once per hour
    gcTime: Infinity, // 🔹 Keep in MMKV disk cache forever
  });
}
