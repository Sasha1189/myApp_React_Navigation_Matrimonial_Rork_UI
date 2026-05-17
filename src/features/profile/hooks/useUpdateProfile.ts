import { storage } from "../../../cache/cacheConfig";
import { Profile } from "../../../types/profile";
import { apiUpdateProfile } from "../api/profileApi";
import { useAuth } from "../../../context/AuthContext";

const PROFILE_CACHE_KEY = "self_profile_cache";

export const useUpdateProfile = (
  user: any,
  profile: Profile,
  setProfile: (p: Profile) => void,
  tier: string,
) => {
  return async (newData: Partial<Profile>) => {
    const gender = profile?.gender || user?.displayName;

    if (!user?.uid || !gender) return;

    const isPaidUser = tier === "basic" || tier === "premium";
    const updatedProfile = { ...profile, ...newData };

    try {
      if (isPaidUser) {
        await apiUpdateProfile({
          uid: user.uid,
          gender: gender,
          ...newData,
        });
      }
      // 2. Sync Local State & MMKV
      setProfile(updatedProfile);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error("❌ Update failed:", error);
      throw error;
    }
  };
};
