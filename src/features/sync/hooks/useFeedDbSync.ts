import { useEffect } from "react";
import { useAuth } from "@/context";
import {
  syncFeedProfiles,
  performDeltaSync,
} from "../services/syncFeedService";

export const useFeedDbSync = () => {
  const { user, tier } = useAuth();

  useEffect(() => {
    if (!user || tier === "none") return;

    let isMounted = true;
    const isPaid = tier === "basic" || tier === "premium";

    console.log("useFeedDbSync start with:", isPaid, user?.displayName);

    const runFeedDbSync = async () => {
      try {
        // 1. Initial / Bulk Sync
        const syncedCount = await syncFeedProfiles(isPaid, user?.displayName);

        // 2. Incremental Delta Sync
        const deltaCount = await performDeltaSync(isPaid, user?.displayName);

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
  }, [user?.uid, tier, user?.displayName]);
};
