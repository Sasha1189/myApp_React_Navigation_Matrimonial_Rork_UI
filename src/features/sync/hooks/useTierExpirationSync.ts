// import { useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { useMyProfile } from "@/features/profile/context/ProfileContext";
// import { deactivateUserProfile } from "../services/tierExpirationService";
// import { Profile } from "@/features/profile/types/profile";

// export const useTierExpirationSync = () => {
//   const { user, tier } = useAuth();
//   const { myProfile, setMyProfile } = useMyProfile();

//   useEffect(() => {
//     // If tier has expired to 'none', but profile is still active
//     if (user?.uid && tier === "none" && myProfile?.ia === true) {
//       const userGender = user.displayName?.trim().toLowerCase();

//       deactivateUserProfile(user.uid, userGender).then(() => {
//         // Safely update React profile state after DB update succeeds
//         setMyProfile((prev: Profile) => ({ ...prev, ia: false }));
//       });
//     }
//   }, [user?.uid, tier, myProfile?.ia, setMyProfile]);
// };

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/features/profile/context/ProfileContext";
import { deactivateUserProfile } from "../services/tierExpirationService";

export const useTierExpirationSync = (enabled: boolean = false) => {
  const { user, tier } = useAuth();
  const { myProfile, setMyProfile } = useMyProfile();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const uid = user?.uid;
  const displayName = user?.displayName;
  const isProfileActive = myProfile?.ia === true;
  const isExpiredTier = tier === "none";

  useEffect(() => {
    // 1. Guard against unready state, disabled flag, non-expired status, or active sync
    if (
      !enabled ||
      !uid ||
      !displayName ||
      !isExpiredTier ||
      !isProfileActive ||
      isSyncRunningRef.current
    ) {
      return;
    }

    let isMounted = true;
    const userGender = displayName.trim().toLowerCase();

    const handleTierExpiration = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await deactivateUserProfile(uid, userGender);

        if (isMounted) {
          // Functional update to preserve any concurrent profile updates
          setMyProfile((prev) => (prev ? { ...prev, ia: false } : prev));
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            "[useTierExpirationSync] Failed to deactivate user profile:",
            error,
          );
        }
      } finally {
        isSyncRunningRef.current = false;
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    handleTierExpiration();

    return () => {
      isMounted = false;
    };
  }, [enabled, uid, displayName, isExpiredTier, isProfileActive, setMyProfile]);

  return { isSyncing };
};
