import { useCallback } from "react";
import { createProfile as createProfileApi } from "@/features/profile/api/profileApi";
import { Profile } from "@/features/profile/types/profile";
import { generateTimeBasedSuffix } from "@/features/profile/utils/IDGenerater";
import { sanitizePayload } from "@/features/profile/utils/sanitizePayload";

import { useAuth, UserTier } from "@/context";
import { useMyProfile } from "@/features/profile/context/ProfileContext";
import { setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { isLocalUrl } from "@/utils/photoUtils";

export const useCreateProfile = () => {
  const { user } = useAuth();
  const { myProfile, setMyProfile } = useMyProfile();

  const createProfileOnServer = useCallback(
    async (newTier: UserTier) => {
      const uid = user?.uid;

      // 1. Strict Validation
      if (!uid) throw new Error("Missing user UID.");
      if (!newTier || newTier === "none") {
        throw new Error("Missing valid tier data.");
      }

      const gender = myProfile.gender?.trim();
      if (!gender) throw new Error("Profile gender is missing.");

      const pid = myProfile.pid?.trim() || generateTimeBasedSuffix();
      if (!pid) throw new Error("Profile ID generation failed.");

      // 2. Validate Remote Photos/Thumbnail
      const validRemotePhotos = (myProfile.photos || []).filter((p: any) => {
        return !isLocalUrl(p);
      });
      const validThumbnail = myProfile.tn ? myProfile.tn : "";

      // 3. Strip local photos & tn out from payload
      const { photos, tn, ...baseSanitized } = sanitizePayload(myProfile);

      const cleanPayload = {
        ...baseSanitized,
        uid,
        pid,
        gender,
        tier: newTier,
        ia: true,
      };

      // 4. API Request
      const serverResponse = await createProfileApi(cleanPayload);

      // 5. Update React State and MMKV Cache
      setMyProfile((prevProfile: Profile) => {
        const mergedProfile = {
          ...prevProfile,
          ...serverResponse,
          photos: validRemotePhotos,
          tn: validThumbnail,
        };
        setCachedProfile(mergedProfile);
        return mergedProfile;
      });

      return serverResponse;
    },
    [user?.uid, myProfile, setMyProfile],
  );

  return {
    createProfileOnServer,
  };
};
