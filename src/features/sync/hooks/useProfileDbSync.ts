import { useEffect } from "react";
import { useAuth } from "@/context";
import {
  syncUserProfiles,
  performDeltaSync,
} from "../services/profileSyncService";

export const useProfileDbSync = () => {
  const { user, tier } = useAuth();

  useEffect(() => {
    if (!user || tier === "none") return;

    let isMounted = true;
    const isPaid = tier === "basic" || tier === "premium";

    const runProfileDbSync = async () => {
      try {
        // 1. Initial / Bulk Sync
        const syncedCount = await syncUserProfiles(isPaid, user?.displayName);

        // 2. Incremental Delta Sync
        const deltaCount = await performDeltaSync(isPaid, user?.displayName);

        if (isMounted) {
          console.log(
            `[useProfileDbSync] Sync complete. Initial: ${syncedCount}, Delta: ${deltaCount}`,
          );
        }
      } catch (error) {
        console.error(
          "[useProfileDbSync] Error during background sync:",
          error,
        );
      }
    };

    runProfileDbSync();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, tier, user?.displayName]);
};
