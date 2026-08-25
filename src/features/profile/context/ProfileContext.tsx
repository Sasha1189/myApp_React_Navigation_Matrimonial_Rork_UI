import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { appStorage } from "@/cacheMMKV/cacheConfig";
import { useAuth } from "@/context/AuthContext";
import { Profile } from "../types/profile";
import { getDefaultProfile } from "../types/getDefaultProfile";
import { getProfile } from "../api/profileService";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

export const PROFILE_CACHE_KEY = "self_profile_cache";

interface ProfileContextType {
  myProfile: Profile;
  setMyProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateMyProfile: (data: Partial<Profile>) => Promise<void>;
  isLoadingProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, tier } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Synchronous initial state load from MMKV
  const [myProfile, setMyProfile] = useState<Profile>(() => {
    try {
      const cached = appStorage?.getString(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : getDefaultProfile();
    } catch {
      return getDefaultProfile();
    }
  });

  const updateMyProfile = useUpdateProfile(user, myProfile, setMyProfile, tier);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      const userGender = user?.displayName?.trim().toLowerCase();
      const isGenderValid = userGender === "male" || userGender === "female";

      if (!user?.uid || !isGenderValid) {
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      // 🎯 FAST PATH: Skip state updates if local state is already hydrated from cache
      if (appStorage?.contains(PROFILE_CACHE_KEY)) {
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      try {
        const remoteData = await getProfile(
          user.uid,
          user.displayName as string,
        );

        if (!isMounted) return;

        if (remoteData) {
          const fullyInjectedProfile = { ...remoteData, uid: user.uid };
          setMyProfile(fullyInjectedProfile);
          appStorage?.set(
            PROFILE_CACHE_KEY,
            JSON.stringify(fullyInjectedProfile),
          );
        } else {
          const freeProfileSeed: Profile = {
            ...getDefaultProfile(),
            uid: user.uid,
            gender: user.displayName as any,
          };
          setMyProfile(freeProfileSeed);
          appStorage?.set(PROFILE_CACHE_KEY, JSON.stringify(freeProfileSeed));
        }
      } catch (error) {
        console.error("❌ [Profile Context]: Failed to fetch profile:", error);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.displayName]);

  // 🎯 MEMOIZE CONTEXT VALUE to prevent infinite re-render loops in child screens
  const contextValue = useMemo(
    () => ({
      myProfile,
      setMyProfile,
      updateMyProfile,
      isLoadingProfile,
    }),
    [myProfile, updateMyProfile, isLoadingProfile],
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
