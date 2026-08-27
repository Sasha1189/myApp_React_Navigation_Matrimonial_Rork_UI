import { useEffect } from "react";
import { useAuth } from "@/context";
import {
  syncFeedProfiles,
  performDeltaSync,
} from "../services/syncFeedService";

export const useFeedDbSync = (enabled: boolean = false) => {
  const { user, tier, isVerified } = useAuth();

  useEffect(() => {
    if (!enabled || !user?.uid || !user?.displayName) return;

    let isMounted = true;
    const isPaid = tier === "basic" || tier === "premium";

    const runFeedDbSync = async () => {
      try {
        // 1. Initial / Bulk Sync
        const syncedCount = await syncFeedProfiles(
          isPaid,
          isVerified,
          user.displayName,
        );

        // 2. Incremental Delta Sync
        const deltaCount = await performDeltaSync(
          isPaid,
          isVerified,
          user.displayName,
        );

        if (isMounted) {
          console.log(
            `[useFeedDbSync] Sync complete. Initial: ${syncedCount}, Delta: ${deltaCount}`,
          );
        }
      } catch (error) {
        console.error("[useFeedDbSync] Error during background sync:", error);
      }
    };

    runFeedDbSync();

    return () => {
      isMounted = false;
    };
  }, [enabled, user?.uid, user?.displayName, tier, isVerified]);
};
