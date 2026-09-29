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
import { Profile } from "../types/profile";
import { getDefaultProfile } from "../types/getDefaultProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { getProfile } from "../api/profileService";

interface ProfileContextType {
  myProfile: Profile;
  setMyProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateMyProfile: (data: Partial<Profile>) => Promise<void>;
  refreshMyProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, gender, tier } = useAuth();

  const [myProfile, setMyProfile] = useState<Profile>(() => {
    return getCachedProfile<Profile>(getDefaultProfile());
  });

  const updateMyProfile = useUpdateProfile(user, setMyProfile, tier, gender);

  const refreshMyProfile = useCallback(async () => {
    const uid = user?.uid;
    if (!uid || !gender) return;
    try {
      const remoteProfile = await getProfile(uid, gender);
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
