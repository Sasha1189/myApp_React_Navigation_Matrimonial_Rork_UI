import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLikedProfilesList,
  fetchReceivedLikesSince,
} from "../../home/apis/likeApis";
import { Profile } from "../../../types/profile";

// export function useLikesSentProfilesList(uid: string) {
//   const queryClient = useQueryClient();

//   return useQuery<Profile[]>({
//     queryKey: ["likesSentProfiles", uid],
//     queryFn: async () => {
//       // 1. Get the list of IDs the user has liked (Master List)
//       const likedIds =
//         queryClient.getQueryData<string[]>(["likesSentIds", uid]) || [];
//       if (likedIds.length === 0) return [];

//       // 2. 🔹 BROWSE ALL FEED CACHES 🔹
//       // Look into every query that starts with "feed" (default, latest, search, etc.)
//       const allCachedFeeds = queryClient
//         .getQueryCache()
//         .findAll({ queryKey: ["feed", uid] });

//       const foundInCache: Map<string, Profile> = new Map();

//       allCachedFeeds.forEach((query) => {
//         const data = query.state.data as any;
//         if (data?.pages) {
//           data.pages.forEach((page: any) => {
//             page.profiles.forEach((p: Profile) => {
//               if (likedIds.includes(p.uid)) {
//                 foundInCache.set(p.uid, p);
//               }
//             });
//           });
//         }
//       });

//       // 3. Identify which IDs are MISSING from the local cache
//       const missingIds = likedIds.filter((id) => !foundInCache.has(id));

//       // 4. If everything is in cache, return it immediately (Zero Network!)
//       if (missingIds.length === 0) {
//         console.log("✅ All liked profiles found in local feed cache!");
//         return likedIds.map((id) => foundInCache.get(id)!);
//       }

//       // 5. 🔹 FALLBACK: Fetch missing profiles from server
//       console.log(
//         `📡 Fetching ${missingIds.length} missing profiles from server...`,
//       );
//       const remoteProfiles = await fetchLikedProfilesList(uid);

//       // Combine cached + remote, ensuring we return the latest-to-old order
//       return remoteProfiles;
//     },
//     enabled: !!uid,
//     staleTime: Infinity, // Trust the local logic
//     gcTime: 1000 * 60 * 60 * 24 * 7,
//   });
// }

// src/features/feed/hooks/useLikesSentProfilesList.ts

export function useLikesSentProfilesList(uid: string) {
  const queryClient = useQueryClient();
  console.log("useLikesSentProfilesList called with uid:", uid); // Debug log
  // 1. Observe the "Official" Liked IDs (this makes the hook reactive)
  const { data: likedIds = [] } = useQuery<string[]>({
    queryKey: ["likesSentIds", uid],
    enabled: !!uid,
    staleTime: Infinity,
  });

  // 2. Observe the Feed Cache (optional, but ensures UI updates if Feed refreshes)
  // We use useMemo to do the heavy lifting of cross-referencing caches
  const matchedProfiles = useMemo(() => {
    if (!likedIds.length) return [];

    // Map all profiles in the feed cache into a Map for O(1) lookup
    const profilesMap = new Map<string, Profile>();
    const feedCache = queryClient
      .getQueryCache()
      .findAll({ queryKey: ["feed", uid] });

    console.log("feedCache:", feedCache.length); // Debug log for feed cache

    feedCache.forEach((q) => {
      const pages = (q.state.data as any)?.pages || [];
      pages.forEach((page: any) => {
        page.profiles?.forEach((p: Profile) => {
          profilesMap.set(p.uid, p);
        });
      });
    });

    // Match IDs to Profiles, Skip (filter) missing ones, and Reverse for Latest -> Oldest
    return [...likedIds]
      .reverse()
      .map((id) => profilesMap.get(id))
      .filter((p): p is Profile => !!p);
  }, [likedIds, uid, queryClient]); // Re-runs only if IDs change or UID changes
  console.log("Matched Profiles from Cache:", matchedProfiles.length); // Debug log for matched profiles
  // 3. Return in a format compatible with your existing useMessagesData
  return {
    data: matchedProfiles,
    isLoading: false,
  };
}

export function useLikesReceivedProfilesList(uid: string) {
  const queryClient = useQueryClient();

  return useQuery<Profile[]>({
    queryKey: ["likesReceivedProfiles", uid],
    queryFn: async () => {
      // 1. Get existing cached profiles
      const existing =
        queryClient.getQueryData<Profile[]>(["likesReceivedProfiles", uid]) ||
        [];

      // 2. Calculate 24h ago timestamp
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();

      // 3. Fetch only NEW likes received in the last 24h
      const newProfiles = await fetchReceivedLikesSince(
        uid,
        twentyFourHoursAgo,
      );

      // 4. Merge: New ones at the top, then existing (filter duplicates)
      const existingIds = new Set(newProfiles.map((p) => p.uid));
      const merged = [
        ...newProfiles,
        ...existing.filter((p) => !existingIds.has(p.uid)),
      ];

      return merged;
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 60 * 24, // 🔹 Check for new likes only once every 24h
    gcTime: 1000 * 60 * 60 * 24 * 30, // Keep in MMKV for 30 days
  });
}
