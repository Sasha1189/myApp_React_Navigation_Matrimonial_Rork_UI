import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { getCachedProfile, setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { useAuth } from "@/context/AuthContext";
import { Profile, ProfileContextType } from "../types/profile";
import { getDefaultProfile } from "../types/getDefaultProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { getProfile } from "../api/profileApi";
import { genderType } from "@/context";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, gender, isPaid } = useAuth();

  const [myProfile, setMyProfile] = useState<Profile>(() => {
    const cached = getCachedProfile<Profile>(getDefaultProfile());
    const updated = {
      ...cached,
      uid: user?.uid || cached.uid,
      gender: (gender as genderType) || cached.gender,
    };
    return updated;
  });

  const updateMyProfile = useUpdateProfile(user, setMyProfile, isPaid, gender);

  const refreshMyProfile = useCallback(async () => {
    const uid = user?.uid;
    if (!uid || !gender || !isPaid) return;
    try {
      const remoteProfile = await getProfile(uid, gender);
      console.log("remotedata:", remoteProfile);
      if (remoteProfile) {
        setMyProfile((prev) => {
          const updated = { ...prev, ...remoteProfile };
          setCachedProfile(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error("❌ [PROFILE REFRESH ERROR]:", error);
    }
  }, [user?.uid]);

  const contextValue = useMemo(
    () => ({
      myProfile,
      setMyProfile,
      updateMyProfile,
      refreshMyProfile,
    }),
    [myProfile, setMyProfile, updateMyProfile, refreshMyProfile],
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useMyProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useMyProfile must be used within a ProfileProvider");
  }
  return context;
};
