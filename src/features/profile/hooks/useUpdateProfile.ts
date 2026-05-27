import { storage } from "../../../cache/cacheConfig";
import { Profile } from "../../../types/profile";
import { apiUpdateProfile } from "../api/profileApi";

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
    const updatedProfile: Profile = {
      ...myProfile,
      ...newData,
      uid: user.uid,
    };

    try {
      if (isPaidUser) {
        await apiUpdateProfile({
          uid: user.uid,
          gender: gender,
          ...newData,
        });
      }
      // 2. Sync Local State & MMKV
      setMyProfile(updatedProfile);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error("❌ Update failed:", error);
      throw error;
    }
  };
};
