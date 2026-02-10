import { useQuery } from "@tanstack/react-query";
import { fetchAllLikedIds } from "../apis/likeApis";

export function useLikesSentIds(uid: string) {
  return useQuery<string[]>({
    queryKey: ["likesSentIds", uid],
    queryFn: async () => {
      const response = await fetchAllLikedIds(uid);
      // 🔹 FIX: Ensure we extract the array if the API returns an object
      return Array.isArray(response)
        ? response
        : (response as any).likedIds || [];
    },
    // 🔹 AGGRESSIVE: Trust the local MMKV cache forever
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 30, // Keep for 30 days
    enabled: !!uid,
    // Default to empty array while loading from MMKV
    initialData: [],
  });
}
