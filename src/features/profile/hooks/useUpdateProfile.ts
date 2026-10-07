import { Dispatch, SetStateAction } from "react";
import { setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { Profile } from "../types/profile";
import { updateProfile } from "../api/profileApi";
import { genderType } from "@/context";

export const useUpdateProfile = (
  user: any,
  setMyProfile: Dispatch<SetStateAction<Profile>>,
  isPaid: boolean,
  gender: genderType,
) => {
  return async (newData: Partial<Profile>) => {
    if (!user?.uid || !gender) return;

    try {
      if (isPaid && Object.keys(newData).length > 0) {
        await updateProfile({
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
