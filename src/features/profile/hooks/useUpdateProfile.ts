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
        console.log("✅ Profile synced to Firestore Server (Paid Tier)");
      } else {
        console.log("💾 Profile saved to MMKV only (Trial Tier)");
      }
      // 2. Sync Local State & MMKV
      setProfile(updatedProfile);
      storage.set(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));

      console.log("✅ Profile updated locally and on Firestore");
    } catch (error) {
      console.error("❌ Update failed:", error);
      throw error; // Let the UI handle the error (e.g., showing a toast)
    }
  };
};
