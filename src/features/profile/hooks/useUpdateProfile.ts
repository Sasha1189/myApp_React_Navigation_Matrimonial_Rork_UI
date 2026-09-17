import { Dispatch, SetStateAction } from "react";
import { setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { Profile } from "../types/profile";
import { apiUpdateProfile } from "../api/profileApi";

export const useUpdateProfile = (
  user: any,
  setMyProfile: Dispatch<SetStateAction<Profile>>,
  tier: string,
) => {
  return async (newData: Partial<Profile>) => {
    const gender = user?.displayName;
    if (!user?.uid || !gender) return;

    const effectiveTier = newData.tier || tier;
    const isPaidUser = effectiveTier === "basic" || effectiveTier === "premium";

    try {
      if (isPaidUser && Object.keys(newData).length > 0) {
        await apiUpdateProfile({
          uid: user.uid,
          gender: user.displayName,
          ...newData,
        });
      }

      setMyProfile((prevProfile: Profile) => {
        const mergedProfile = {
          ...prevProfile,
          ...newData,
          uid: user.uid,
        };
        setCachedProfile(mergedProfile);
        return mergedProfile;
      });
    } catch (error) {
      console.error("[useUpdateProfile] Update failed:", error);
      throw error;
    }
  };
};
