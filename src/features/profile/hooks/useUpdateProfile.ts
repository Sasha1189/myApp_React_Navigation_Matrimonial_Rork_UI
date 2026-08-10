import { storage } from "../../../cache/cacheConfig";
import { Profile } from "../../../types/profile";
import { apiUpdateProfile } from "../api/profileApi";
import { sanitizePayload } from "../../../utils/sanitizePayload";

const PROFILE_CACHE_KEY = "self_profile_cache";

export const useUpdateProfile = (
  user: any,
  myProfile: Profile,
  setMyProfile: (p: Profile) => void,
  tier: string,
) => {
  return async (newData: Partial<Profile>) => {
    const gender = myProfile?.gender || user?.displayName;

    if (!user?.uid || !gender) return;

    const isPaidUser = tier === "basic" || tier === "premium";

    // 1. Sanitize incoming section updates immediately
    const cleanNewData = sanitizePayload(newData);

    // 2. Build the updated profile blueprint for local memory
    const rawUpdatedProfile = {
      ...myProfile,
      ...cleanNewData,
      uid: user.uid,
      gender: gender,
    };

    // 3. Clean the local profile memory copy to strip out any existing blank keys
    const fullySanitizedProfile = sanitizePayload(rawUpdatedProfile) as Profile;

    try {
      // 4. Server-Write Path (Strictly limited to Paid users per business logic)
      if (isPaidUser) {
        // Paid tiers push only their sanitized changes to the cloud database
        if (Object.keys(cleanNewData).length > 0) {
          await apiUpdateProfile({
            uid: user.uid,
            gender: gender,
            ...cleanNewData,
          });
        }
      }

      // 5. Sync Local State & MMKV Storage Cache cleanly
      setMyProfile(fullySanitizedProfile);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(fullySanitizedProfile));
    } catch (error) {
      throw error;
    }
  };
};
