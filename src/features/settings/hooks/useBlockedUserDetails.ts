import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BlockedUserDetail } from "../../../types/profile";

export function useBlockedUserDetails(uid: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<BlockedUserDetail[]>({
    queryKey: ["blockedUserDetails", uid],
    enabled: !!uid,
    queryFn: async () => {
      return [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    networkMode: 'offlineFirst',
  });

  const addBlockedUser = (newBlock: BlockedUserDetail) => {
    queryClient.setQueryData(["blockedUserDetails", uid], (old: BlockedUserDetail[] = []) => {
      const updated = [...old, newBlock];
      return updated;
    });
  };

  return { ...query, addBlockedUser };
}
