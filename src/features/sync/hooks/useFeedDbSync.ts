import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context";
import { useMyProfile } from "@/features/profile/context/ProfileContext";
import {
  syncFeedProfiles,
  performDeltaSync,
} from "../services/syncFeedService";

export const useFeedDbSync = (enabled: boolean = false) => {
  const { user, tier } = useAuth();
  const { myProfile } = useMyProfile();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const isVerified = Boolean(myProfile?.iv);
  const isPaid = tier === "basic" || tier === "premium";
  const userId = user?.uid;
  const displayName = user?.displayName;

  useEffect(() => {
    // 1. Guard against unready state or disabled hook
    if (!enabled || !userId || !displayName || isSyncRunningRef.current) {
      return;
    }

    let isMounted = true;

    const runFeedDbSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        // 2. Initial / Bulk Sync
        const syncedCount = await syncFeedProfiles(
          isPaid,
          isVerified,
          displayName,
        );

        // 3. Incremental Delta Sync
        const deltaCount = await performDeltaSync(
          isPaid,
          isVerified,
          displayName,
        );
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
    // Stabilized primitive dependencies
  }, [enabled, userId, displayName, isPaid, isVerified]);

  return { isSyncing };
};
