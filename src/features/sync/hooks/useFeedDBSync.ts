import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context";
import {
  syncFeedProfiles,
  performDeltaSync,
} from "../services/syncFeedService";

export const useFeedDBSync = (enabled: boolean = false) => {
  const { user, gender, isFullyEntitled } = useAuth();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const userId = user?.uid;

  useEffect(() => {
    if (!enabled || !userId || !gender.trim() || isSyncRunningRef.current) {
      return;
    }

    let isMounted = true;

    const runFeedDBSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await syncFeedProfiles(isFullyEntitled, gender);
        await performDeltaSync(isFullyEntitled, gender);
      } catch (error) {
        console.error("[useFeedDbSync] Error during background sync:", error);
      } finally {
        isSyncRunningRef.current = false;
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    runFeedDBSync();
    return () => {
      isMounted = false;
    };
  }, [enabled, userId, gender, isFullyEntitled]);

  return { isSyncing };
};
