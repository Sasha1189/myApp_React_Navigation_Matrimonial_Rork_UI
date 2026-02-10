import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LikePendingStore } from "../../../cache/likePendingStore";

///////gemini code

export function useToggleLike(uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      // 1. Save to MMKV Pending Queue (for background sync)
      LikePendingStore.toggle(uid, targetId);
      return targetId;
    },
    onMutate: async (targetId) => {
      console.log("1. Toggling hit for:", targetId);
      // 🔹 INSTANT UI: Update the Master List of Liked IDs
      queryClient.cancelQueries({ queryKey: ["likesSentIds", uid] });

      const queryKey = ["likesSentIds", uid];

      const previousLikes = queryClient.getQueryData<string[]>(queryKey) || [];

      console.log("2. Previous likes captured:", previousLikes);

      queryClient.setQueryData(queryKey, (old: string[] = []) => {
        const safeOld = Array.isArray(old) ? old : [];
        const isCurrentlyLiked = safeOld.includes(targetId);

        const updated = isCurrentlyLiked
          ? safeOld.filter((id) => id !== targetId)
          : [...safeOld, targetId];

        return updated;
      });

      console.log("3. Optimistically toggled like for:", targetId);
      console.log("4. Final Cache State:", queryClient.getQueryData(queryKey));
      return { previousLikes };
    },
    onError: (err, targetId, context) => {
      // Rollback if something goes wrong
      if (context?.previousLikes) {
        queryClient.setQueryData(["likesSentIds", uid], context.previousLikes);
      }
    },
  });
}
