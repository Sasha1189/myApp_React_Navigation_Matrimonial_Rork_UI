import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleLike, likesSentIdsList, likesReceivedIdsList,likesSentProfilesList,likesReceivedProfilesList } from "../apis/likeApis";
import { Profile } from "../../../types/profile";

export function useToggleLike() {
  // console.log("useToggleLike called");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, uid }: { profileId: string; uid: string }) =>
      toggleLike(profileId, uid),

    // ✅ Optimistic update
    onMutate: async ({ profileId, uid }) => {
      // console.log("onMutate START", { profileId, uid });

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
        queryClient.setQueryData(key, (old: any) => {
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
      console.log("onError rollback");
      if (context?.previousFeeds) {
        for (const [key, data] of context.previousFeeds) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousSent) {
        queryClient.setQueryData(["likesSent"], context.previousSent);
      }
    },

    // ✅ Optional: re-sync after success
    // onSettled: (_data, _err, { uid }) => {
    //   queryClient.invalidateQueries({ queryKey: ["feed"] });
    //   queryClient.invalidateQueries({ queryKey: ["likesSent", uid] });
    // },
  });
}
// ---- Ids hooks ----
export function useLikesSentIdsList(uid: string) {
  return useQuery({
    queryKey: ["likesSentIds", uid],
    queryFn: () => likesSentIdsList(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
}

export function useLikesReceivedIdsList(uid: string) {
    return useQuery({
      queryKey: ["likesReceivedIds", uid],
      queryFn: () => likesReceivedIdsList(uid),
      enabled: !!uid,
       staleTime: 1000 * 60 * 5,
    });
}

// ---- Hydrated hooks (profiles) ----
export function useLikesSentProfilesList(uid: string) {
  return useQuery({
    queryKey: ["likesSentProfiles", uid],
    queryFn: likesSentProfilesList,
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLikesReceivedProfilesList(uid: string) {
  return useQuery({
    queryKey: ["likesReceivedProfiles", uid],
    queryFn: likesReceivedProfilesList,
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}