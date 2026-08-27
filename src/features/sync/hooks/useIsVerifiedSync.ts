import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { appStorage, IS_VERIFIED_CACHE_KEY } from "@/cacheMMKV/cacheConfig";
import { checkUserVerification } from "@/features/sync/services/verificationService";

export const useIsVerifiedSync = (uid?: string, enabled: boolean = false) => {
  const { isVerified, setIsVerified } = useAuth();

  useEffect(() => {
    // 1. Guard against disabled flag, missing UID, or already verified status
    if (!enabled || !uid || isVerified) return;

    const syncVerification = async () => {
      try {
        const isVerifiedRTDB = await checkUserVerification(uid);

        if (isVerifiedRTDB) {
          // 2. Persist to MMKV for offline boot
          appStorage.set(IS_VERIFIED_CACHE_KEY, true);

          // 3. Update React AuthContext state to trigger immediate router unlock
          setIsVerified?.(true);
        }
      } catch (error) {
        console.error(
          "[useIsVerifiedSync] Failed to sync user verification status:",
          error,
        );
      }
    };

    syncVerification();
  }, [uid, enabled, isVerified, setIsVerified]);
};
