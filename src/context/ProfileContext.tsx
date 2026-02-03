import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  useProfileData,
  useUpdateProfileData,
} from "../features/profile/hooks/useProfileData";
import { Profile } from "../types/profile";
import {
  ProfileContextType,
  ProfileProviderProps,
} from "./types/profileContext";
import { getDefaultProfile } from "src/utils/getDefaultProfile";
import LoadingScreen from "src/components/LoadingScreen";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user, authLoading } = useAuth();
  const uid = user?.uid;
  const initialGender = (user?.displayName as Profile["gender"]) || "Other";

  const { data, isLoading, error, refetch } = useProfileData(
    uid,
    initialGender,
  );

  const value: ProfileContextType = useMemo(() => {
    const profile = data || {
      ...getDefaultProfile(),
      uid: uid,
      gender: initialGender,
    };
    return {
      profile,
      error: error ? (error as Error).message : null,
      loading: isLoading && !data, // Only "Loading" if we have no cached data at all
      reloadProfile: refetch,
    };
  }, [data, isLoading, error, refetch, uid, initialGender]);

  // 4. Handle Loading States
  if (authLoading) return <LoadingScreen />;

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// 🔹 Hook to use ProfileContext
export function useProfileContext(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfileContext must be used inside ProfileProvider");
  }
  return ctx;
}
