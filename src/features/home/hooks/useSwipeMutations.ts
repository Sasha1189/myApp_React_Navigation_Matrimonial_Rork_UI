import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleLike, likesSentIdsList, likesReceivedIdsList,likesSentProfilesList,likesReceivedProfilesList } from "../apis/likeApis";
import { Profile } from "../../../types/profile";
import { LikePendingStore } from "../../../cache/likePendingStore";
import { fetchAllLikedIds, syncLikesBatch  } from "../apis/likeApis";


export function useToggleLikee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, uid }: { profileId: string; uid: string }) =>
      toggleLike(profileId, uid),

    // ✅ Optimistic update
    onMutate: async ({ profileId, uid }) => {
      // cancel all ongoing feed queries
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      // snapshot of current state
      const previousFeeds = queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.queryKey[0] === "feed")
        .map((q) => [q.queryKey, q.state.data]);

      const previousSent = queryClient.getQueryData<string[]>([
        "likesSent",
        uid,
      ]);

      // loop over all feed queries
      for (const [key, oldData] of previousFeeds) {
        queryClient.setQueryData(key as any, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              profiles: page.profiles.map((p: Profile) =>
                p.uid === profileId
                  ? {
                      ...p,
                      liked: !(p.liked ?? false),
                      likeCount: p.liked
                        ? Math.max((p.likeCount ?? 1) - 1, 0)
                        : (p.likeCount ?? 0) + 1,
                    }
                  : p
              ),
            })),
          };
        });
      }

      // update likesSent cache
      queryClient.setQueryData(["likesSent", uid], (old: string[] = []) => {
        const set = new Set(old);
        if (set.has(profileId)) {
          set.delete(profileId); // unlike
        } else {
          set.add(profileId); // like
        }
        return Array.from(set);
      });

      return { previousFeeds, previousSent };
    },

    // ❌ Rollback if error
    onError: (_err, _vars, context) => {
      if (context?.previousFeeds) {
        for (const [key, data] of context.previousFeeds) {
          queryClient.setQueryData(key as any, data);
        }
      }
      if (context?.previousSent) {
        queryClient.setQueryData(["likesSent"], context.previousSent);
      }
    },
  });
}
// ---- Ids hooks ----
export function useLikesSentIdsList(uid: string) {
  return useQuery({
    queryKey: ["likesSentIds", uid],
    queryFn: () => likesSentIdsList(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}

export function useLikesReceivedIdsList(uid: string) {
    return useQuery({
      queryKey: ["likesReceivedIds", uid],
      queryFn: () => likesReceivedIdsList(uid),
      enabled: !!uid,
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
    });
}

// ---- Hydrated hooks (profiles) ----
export function useLikesSentProfilesList(uid: string) {
  return useQuery({
    queryKey: ["likesSentProfiles", uid],
    queryFn: () => likesSentProfilesList(),
    enabled: !!uid,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}

export function useLikesReceivedProfilesList(uid: string) {
  return useQuery({
    queryKey: ["likesReceivedProfiles", uid],
    queryFn: () => likesReceivedProfilesList(),
    enabled: !!uid,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
///////gemini code


export function useLikesSentIds(uid: string) {
  return useQuery({
    queryKey: ["likesSentIds", uid],
    queryFn: () => fetchAllLikedIds(uid),
    staleTime: Infinity, // Keep in MMKV forever
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

export function useToggleLike(uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      // 1. Update MMKV Pending Queue (for unmount/startup sync)
      LikePendingStore.toggle(uid, targetId);
      return targetId;
    },
    onMutate: async (targetId) => {
      await queryClient.cancelQueries({ queryKey: ["likesSentIds", uid] });
      await queryClient.cancelQueries({ queryKey: ["feed", uid] });

      // 🔹 1. Update the "Heart" List Cache
      queryClient.setQueryData(["likesSentIds", uid], (old: string[] = []) => {
        return old.includes(targetId) ? old.filter(id => id !== targetId) : [...old, targetId];
      });

      // 🔹 2. Update ALL Feeds (Default, Latest, etc)
      queryClient.setQueriesData({ queryKey: ["feed", uid] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            profiles: page.profiles.map((p: any) => 
              p.uid === targetId ? { ...p, liked: !p.liked } : p
            )
          }))
        };
      });
    }
  });
}

export const performSync = async (uid: string) => {
    const pending = LikePendingStore.get(uid);
    if (pending.length === 0) return;

    try {
      await syncLikesBatch(uid, pending);
      LikePendingStore.clear(uid, pending);
      console.log("✅ Likes synced with Firestore");
    } catch (e) {
      console.warn("Retrying sync next time...");
    }
};