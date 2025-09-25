import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  useProfileData,
  useUpdateProfileData,
} from "../features/profile/hooks/useProfile";
import { Profile } from "../types/profile";
import {
  ProfileContextType,
  ProfileProviderProps,
} from "./types/profileContext";
import { getDefaultProfile } from "src/utils/getDefaultProfile";

// 🔹 Create context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const uid = user?.uid as Profile["uid"];
  const gender = user?.displayName as Profile["gender"];

  const { data, isLoading, error, refetch } = useProfileData(uid, gender);
  const [profile, setProfile] = useState<Profile>(getDefaultProfile());

  // ✅ Sync query data into context once it changes
  useEffect(() => {
    if (data) setProfile(data);
  }, [data]);

  const value: ProfileContextType = useMemo(
    () => ({
      profile,
      error,
      loading: isLoading,
      reloadProfile: refetch,
    }),
    [profile, isLoading, refetch]
  );

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
