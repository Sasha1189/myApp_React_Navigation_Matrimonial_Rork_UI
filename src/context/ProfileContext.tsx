import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  useProfileData,
  useUpdateProfileData,
} from "../src/hooks/queries/useProfile";
import { Profile } from "../types/profile";

interface ProfileContextType {
  profile?: Profile;
  loading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  reloadProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const uid = user?.uid as Profile["uid"];
  const gender = user?.displayName as Profile["gender"];

  const { data: profile, isLoading, refetch } = useProfileData(uid, gender);
  const { mutateAsync: updateProfileMutation } = useUpdateProfileData(
    uid,
    gender
  );

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      await updateProfileMutation(data);
      // maybe show toast or navigation
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const value: ProfileContextType = useMemo(
    () => ({
      profile,
      loading: isLoading,
      updateProfile,
      reloadProfile: refetch,
    }),
    [profile, isLoading, updateProfile, refetch]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfileContext must be used inside ProfileProvider");
  return ctx;
};
