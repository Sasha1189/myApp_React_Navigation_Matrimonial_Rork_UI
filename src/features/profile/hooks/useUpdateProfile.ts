import { storage } from "../../../cache/cacheConfig";
import { Profile } from "../../../types/profile";
import { apiUpdateProfile } from "../api/profileApi";

const PROFILE_CACHE_KEY = "self_profile_cache";

export const useUpdateProfile = (
  user: any,
  profile: Profile,
  setProfile: (p: Profile) => void,
) => {
  return async (newData: Partial<Profile>) => {
    const gender = user?.displayName;
    if (!user?.uid || !gender) return;

    try {
      // 2. Server Update
      const updatedFromServer = await apiUpdateProfile({
        uid: user.uid,
        gender: gender as any,
        ...newData,
      });

      // 3. Final Sync
      setProfile(updatedFromServer);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(updatedFromServer));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };
};
