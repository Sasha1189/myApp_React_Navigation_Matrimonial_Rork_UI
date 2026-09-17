import { useEffect, useRef, useState } from "react";
import { useMyProfile } from "@/features/profile/context/ProfileContext";
import { checkUserVerification } from "@/features/sync/services/verificationService";

export const useIsVerifiedSync = (uid: string, enabled: boolean = false) => {
  const { myProfile, updateMyProfile, setMyProfile } = useMyProfile();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const isVerified = Boolean(myProfile?.iv);

  useEffect(() => {
    if (!enabled || !uid || isVerified || isSyncRunningRef.current) return;

    let isMounted = true;

    const syncVerification = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        const isVerifiedRTDB = await checkUserVerification(uid);
        if (isMounted && isVerifiedRTDB) {
          await updateMyProfile({ iv: isVerifiedRTDB });
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            "[useIsVerifiedSync] Failed to sync user verification status:",
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

    syncVerification();

    return () => {
      isMounted = false;
    };
  }, [uid, enabled, isVerified, setMyProfile]);

  return { isSyncing };
};
