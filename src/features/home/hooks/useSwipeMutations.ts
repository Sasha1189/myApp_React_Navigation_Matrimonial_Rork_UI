import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LikePendingStore } from "../../../cache/likePendingStore";

export function useToggleLike(uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      // 1. Save to MMKV Pending Queue
      LikePendingStore.toggle(uid, targetId);
      return targetId;
    },

    onMutate: async (targetId) => {
      // 🔹 INSTANT UI: Update the Master ID list
      await queryClient.cancelQueries({ queryKey: ["likesSentIds", uid] });
      const queryKey = ["likesSentIds", uid];
      const previousLikes = queryClient.getQueryData<string[]>(queryKey) || [];

      queryClient.setQueryData(queryKey, (old: string[] = []) => {
        const safeOld = Array.isArray(old) ? old : [];
        return safeOld.includes(targetId)
          ? safeOld.filter((id) => id !== targetId)
          : [...safeOld, targetId];
      });

      return { previousLikes };
    },

    // 🔹 SUCCESS: Sync the Profiles List for the Messages Screen
    onSuccess: (targetId) => {
      const isLiked = (
        queryClient.getQueryData<string[]>(["likesSentIds", uid]) || []
      ).includes(targetId);

      queryClient.setQueryData(
        ["likesSentProfiles", uid],
        (old: any[] = []) => {
          if (isLiked) {
            // 1. Add to "Likes Sent" list for the Messages Screen
            // We pull the profile from the "feed" or "selfProfile" cache
            const profileData = queryClient.getQueryData(["profile", targetId]);

            // Avoid duplicates
            const filtered = old.filter((p) => p.uid !== targetId);
            return profileData ? [profileData, ...filtered] : old;
          } else {
            // 2. Remove from "Likes Sent" list if unliked
            return old.filter((p: any) => p.uid !== targetId);
          }
        },
      );
    },

    onError: (err, targetId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["likesSentIds", uid], context.previousLikes);
      }
    },
  });
}
