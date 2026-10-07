import { useEffect, useRef, useState } from "react";
import { checkUserVerification } from "../services/verificationService";
import { VerificationStatus } from "@/context/types/auth.types";
import { setVerifiedCache } from "@/cacheMMKV/cacheConfig";

export const useVerificationSync = (
  uid: string | undefined,
  isPaid: boolean,
  currentVerifiedStatus: boolean,
) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  useEffect(() => {
    if (!uid || !isPaid || !currentVerifiedStatus || isSyncRunningRef.current) {
      return;
    }

    let isMounted = true;

    const syncVerification = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        const serverStatus = await checkUserVerification(uid);
        if (
          isMounted &&
          (serverStatus === "true" || serverStatus === "false")
        ) {
          setVerifiedCache(serverStatus as VerificationStatus);
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            "❌ [useVerificationSync] Failed to sync verification status:",
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
  }, [uid, isPaid, currentVerifiedStatus]);

  return { isSyncing };
};
