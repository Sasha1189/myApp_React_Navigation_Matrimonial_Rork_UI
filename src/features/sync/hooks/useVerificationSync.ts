import { useEffect, useRef, useState } from "react";
import { checkUserVerification } from "../services/verificationService";
import { VerificationStatus } from "@/context/types/auth.types";

export const useVerificationSync = (
  uid: string | undefined,
  isPaid: boolean,
  currentVerifiedStatus: VerificationStatus,
  updateVerificationStatus: (status: VerificationStatus) => void,
) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  useEffect(() => {
    if (
      !uid ||
      !isPaid ||
      currentVerifiedStatus !== "pending" ||
      isSyncRunningRef.current
    ) {
      return;
    }

    let isMounted = true;

    const syncVerification = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        // Fetch from Firestore instead of RTDB
        const serverStatus = await checkUserVerification(uid);

        // If the server status exists and is different from local "pending", update it
        if (
          isMounted &&
          (serverStatus === "true" || serverStatus === "false")
        ) {
          updateVerificationStatus(serverStatus as VerificationStatus);
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
  }, [uid, isPaid, currentVerifiedStatus, updateVerificationStatus]);

  return { isSyncing };
};
