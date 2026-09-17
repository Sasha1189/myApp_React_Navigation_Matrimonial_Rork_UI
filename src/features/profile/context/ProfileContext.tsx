// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useMemo,
//   ReactNode,
// } from "react";
// import { getCachedProfile, setCachedProfile } from "@/cacheMMKV/cacheConfig";
// import { useAuth } from "@/context/AuthContext";
// import { Profile } from "../types/profile";
// import { getDefaultProfile } from "../types/getDefaultProfile";
// import { getProfile } from "../api/profileService";
// import { useUpdateProfile } from "../hooks/useUpdateProfile";

// interface ProfileContextType {
//   myProfile: Profile;
//   setMyProfile: React.Dispatch<React.SetStateAction<Profile>>;
//   updateMyProfile: (data: Partial<Profile>) => Promise<void>;
//   isLoadingProfile: boolean;
// }

// const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// export const ProfileProvider = ({ children }: { children: ReactNode }) => {
//   const { user, tier } = useAuth();
//   const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
//   const [myProfile, setMyProfile] = useState<Profile>(() =>
//     getCachedProfile<Profile>(getDefaultProfile()),
//   );

//   const updateMyProfile = useUpdateProfile(user, setMyProfile, tier);

//   useEffect(() => {
//     let isMounted = true;

//     const syncProfile = async () => {
//       const uid = user?.uid;
//       const gender = user?.displayName?.trim().toLowerCase();
//       const isValidGender = gender === "male" || gender === "female";

//       // Guard: invalid user session
//       if (!uid || !isValidGender) {
//         if (isMounted) setIsLoadingProfile(false);
//         return;
//       }

//       // Check: Skip network call if local cache already holds valid profile data
//       const hasValidCache =
//         myProfile?.uid === uid && Boolean(myProfile?.gender);
//       if (hasValidCache) {
//         if (isMounted) setIsLoadingProfile(false);
//         return;
//       }

//       // Sync: Fetch from server if cache is missing essential fields
//       try {
//         const remoteData = await getProfile(uid, user.displayName as string);
//         if (!isMounted) return;

//         const freshProfile: Profile = remoteData
//           ? { ...remoteData, uid }
//           : { ...getDefaultProfile(), uid, gender: user.displayName as any };

//         setMyProfile(freshProfile);
//         setCachedProfile(freshProfile);
//       } catch (error) {
//         console.error("❌ [ProfileContext] Sync failed:", error);
//       } finally {
//         if (isMounted) setIsLoadingProfile(false);
//       }
//     };

//     syncProfile();

//     return () => {
//       isMounted = false;
//     };
//   }, [user?.uid, user?.displayName]);

//   const contextValue = useMemo(
//     () => ({
//       myProfile,
//       setMyProfile,
//       updateMyProfile,
//       isLoadingProfile,
//     }),
//     [myProfile, setMyProfile, updateMyProfile, isLoadingProfile],
//   );

//   return (
//     <ProfileContext.Provider value={contextValue}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };

// export const useMyProfile = () => {
//   const context = useContext(ProfileContext);
//   if (!context) {
//     throw new Error("useMyProfile must be used within a ProfileProvider");
//   }
//   return context;
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { getCachedProfile, setCachedProfile } from "@/cacheMMKV/cacheConfig";
import { useAuth } from "@/context/AuthContext";
import { Profile } from "../types/profile";
import { getDefaultProfile } from "../types/getDefaultProfile";
import { getProfile } from "../api/profileService";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

console.log("👤 [PROFILE FILE] ProfileContext.tsx module loaded");

interface ProfileContextType {
  myProfile: Profile;
  setMyProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateMyProfile: (data: Partial<Profile>) => Promise<void>;
  isLoadingProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  console.log("👤 [PROFILE 1/5] ProfileProvider component executing...");

  const { user, tier } = useAuth();
  console.log(
    "👤 [PROFILE 2/5] Auth context read | UID:",
    user?.uid ?? "null",
    "| Tier:",
    tier,
  );

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const [myProfile, setMyProfile] = useState<Profile>(() => {
    try {
      console.log("👤 [PROFILE 3/5] Reading initial cached profile...");
      const cached = getCachedProfile<Profile>(getDefaultProfile());
      console.log(
        "👤 [PROFILE 3/5 SUCCESS] Cached profile UID:",
        cached?.uid ?? "none",
      );
      return cached;
    } catch (err) {
      console.error(
        "❌ [PROFILE CACHE ERROR] Failed to read cached profile:",
        err,
      );
      return getDefaultProfile();
    }
  });

  console.log("👤 [PROFILE 4/5] Initializing useUpdateProfile hook...");
  const updateMyProfile = useUpdateProfile(user, setMyProfile, tier);
  console.log("👤 [PROFILE 4/5 SUCCESS] useUpdateProfile initialized safely");

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      const uid = user?.uid;
      const gender = user?.displayName?.trim().toLowerCase();
      const isValidGender = gender === "male" || gender === "female";

      console.log(
        "👤 [PROFILE 5/5 EFFECT] Running syncProfile | UID:",
        uid ?? "null",
        "| Gender:",
        gender ?? "null",
      );

      // Guard: invalid user session
      if (!uid || !isValidGender) {
        console.log(
          "👤 [PROFILE GUARD] Skipped sync: Invalid or logged-out session",
        );
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      // Check: Skip network call if local cache already holds valid profile data
      const hasValidCache =
        myProfile?.uid === uid && Boolean(myProfile?.gender);
      if (hasValidCache) {
        console.log("👤 [PROFILE GUARD] Skipped sync: Cache already valid");
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      // Sync: Fetch from server if cache is missing essential fields
      try {
        console.log("👤 [PROFILE SYNC] Fetching remote profile for UID:", uid);
        const remoteData = await getProfile(uid, user.displayName as string);
        if (!isMounted) return;

        const freshProfile: Profile = remoteData
          ? { ...remoteData, uid }
          : { ...getDefaultProfile(), uid, gender: user.displayName as any };

        setMyProfile(freshProfile);
        setCachedProfile(freshProfile);
        console.log(
          "👤 [PROFILE SYNC SUCCESS] Remote profile synced and cached",
        );
      } catch (error) {
        console.error("❌ [PROFILE SYNC ERROR] Sync failed:", error);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.displayName]);

  const contextValue = useMemo(
    () => ({
      myProfile,
      setMyProfile,
      updateMyProfile,
      isLoadingProfile,
    }),
    [myProfile, setMyProfile, updateMyProfile, isLoadingProfile],
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
