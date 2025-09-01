import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeProfile, passProfile, superLikeProfile } from "../apis/feedApi";
import { Profile } from "../../../types/profile";

function optimisticUpdate(queryClient: any, uid: string) {
  queryClient.setQueryData(["profiles"], (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        data: page.data.filter((p: Profile) => p.uid !== uid),
      })),
    };
  });
}

export function useLikeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: likeProfile,
    onMutate: async (uid: string) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      optimisticUpdate(queryClient, uid);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function usePassProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: passProfile,
    onMutate: async (uid: string) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      optimisticUpdate(queryClient, uid);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useSuperLikeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superLikeProfile,
    onMutate: async (uid: string) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      optimisticUpdate(queryClient, uid);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
