import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../api/profileApi";
import { getDefaultProfile } from "../../../utils/getDefaultProfile";
import { Profile } from "../../../types/profile";

export const useProfileData = (
  uid: string | undefined,
  gender: string = "",
) => {
  return useQuery<Profile>({
    queryKey: ["selfProfile", uid],
    queryFn: async (): Promise<Profile> => {
      if (!uid) throw new Error("No UID for self profile fetch");

      // Fetch from Firestore
      const remoteData = await getProfile(uid, gender);

      // Merge: Default -> Remote -> Explicit Context
      return {
        ...getDefaultProfile(),
        ...(remoteData || {}),
        uid,
        gender: (remoteData?.gender || gender) as Profile["gender"],
      };
    },
    enabled: !!uid && !!gender,
    staleTime: 1000 * 60 * 60 * 24, // 24h: Cache is "fresh" for a day
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7d: Keep in MMKV for a week
  });
};

export const useUpdateProfileData = (
  uid: string,
  gender: "" | "Male" | "Female" = "",
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) =>
      updateProfile({ uid, gender, ...data }),

    // 🔹 Optimistic Update: Update the UI before the server responds
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["selfProfile", uid] });
      const previousProfile = queryClient.getQueryData(["selfProfile", uid]);

      queryClient.setQueryData(["selfProfile", uid], (old: Profile) => ({
        ...old,
        ...newData,
      }));

      return { previousProfile };
    },
    // Rollback if Firestore fails
    onError: (err, newData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["selfProfile", uid], context.previousProfile);
      }
    },
    // Refetch to ensure we are in sync with server logic
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["selfProfile", uid] });
    },
  });
};
