import { Dispatch, SetStateAction } from "react";
import { setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { Profile } from "../types/profile";
import { apiUpdateProfile } from "../api/profileApi";
import { genderType } from "@/context";

export const useUpdateProfile = (
  user: any,
  setMyProfile: Dispatch<SetStateAction<Profile>>,
  tier: string,
  gender: genderType,
) => {
  return async (newData: Partial<Profile>) => {
    if (!user?.uid || !gender) return;

    //for first time after payment immediate tier
    const effectiveTier = newData.tier || tier;
    const isPaid = effectiveTier === "basic" || effectiveTier === "premium";

    try {
      if (isPaid && Object.keys(newData).length > 0) {
        await apiUpdateProfile({
          uid: user.uid,
          gender: gender,
          ...newData,
        });
      }

      setMyProfile((prevProfile: Profile) => {
        const mergedProfile = {
          ...prevProfile,
          ...newData,
          gender: gender,
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
