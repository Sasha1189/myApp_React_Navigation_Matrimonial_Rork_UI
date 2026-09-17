import { useEffect, useRef, useState } from "react";
import { useAuth, useEntitlement } from "@/context";
import {
  syncFeedProfiles,
  performDeltaSync,
} from "../services/syncFeedService";

export const useFeedDbSync = (enabled: boolean = false) => {
  const { user } = useAuth();
  const { isPaid } = useEntitlement();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const userId = user?.uid;
  const gender = user?.displayName ?? "";

  useEffect(() => {
    if (!enabled || !userId || !gender.trim() || isSyncRunningRef.current) {
      return;
    }

    let isMounted = true;

    const runFeedDbSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await syncFeedProfiles(isPaid, gender);
        await performDeltaSync(isPaid, gender);
      } catch (error) {
        console.error("[useFeedDbSync] Error during background sync:", error);
      } finally {
        isSyncRunningRef.current = false;
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    runFeedDbSync();
    return () => {
      isMounted = false;
    };
  }, [enabled, userId, gender, isPaid]);

  return { isSyncing };
};
