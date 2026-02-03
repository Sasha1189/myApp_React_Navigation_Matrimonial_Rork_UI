import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProfileData } from "../../profile/hooks/useProfileData";
import { Profile, BlockedUserDetail } from "../../../types/profile";

export const useBlockUnblockUser = (
  uid: string,
  gender: "" | "Male" | "Female" = ""
) => {
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfileData(uid, gender);
  const isReady = !!uid && !!gender;

  const getCurrentBlockedUIDs = (): string[] => {
    if (!isReady) return [];
    const current = queryClient.getQueryData<Profile>(["profile", uid]);
    return current?.blockedUserUIDs ?? [];
  };

  const getCurrentBlockedDetails = (): BlockedUserDetail[] => {
    return queryClient.getQueryData<BlockedUserDetail[]>([
      "blockedUserDetails",
      uid,
    ]) ?? [];
  };

  const blockUser = (target: BlockedUserDetail) => {
    if (!isReady) return;
    if (!target.uid || target.uid === uid) return;

    const currentUIDs = getCurrentBlockedUIDs();
    if (currentUIDs.includes(target.uid)) return;

    const nextUIDs = [...currentUIDs, target.uid];

    // 1) Update Firestore (profile)
    updateProfile.mutate({ blockedUserUIDs: nextUIDs });

    // 2) Optimistically update cache-only details list
    const currentDetails = getCurrentBlockedDetails();
    const exists = currentDetails.some((u) => u.uid === target.uid);
    if (!exists) {
      queryClient.setQueryData<BlockedUserDetail[]>(
        ["blockedUserDetails", uid],
        [...currentDetails, target]
      );
    }
  };

  const unblockUser = (targetUid: string) => {
    if (!isReady) return;
    if (!targetUid) return;

    const currentUIDs = getCurrentBlockedUIDs();
    if (!currentUIDs.includes(targetUid)) return;

    const nextUIDs = currentUIDs.filter((id) => id !== targetUid);

    // 1) Update Firestore
    updateProfile.mutate({ blockedUserUIDs: nextUIDs });

    // 2) Update cache-only details list
    const currentDetails = getCurrentBlockedDetails();
    const nextDetails = currentDetails.filter((u) => u.uid !== targetUid);

    queryClient.setQueryData<BlockedUserDetail[]>(
      ["blockedUserDetails", uid],
      nextDetails
    );
  };

  return {
    blockUser,
    unblockUser,
    isReady,
    // isLoading: updateProfile.isLoading,
    error: updateProfile.error,
  };
};
