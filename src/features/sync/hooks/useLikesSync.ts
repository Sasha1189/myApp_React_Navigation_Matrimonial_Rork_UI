import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncLikes } from "../services/likesSyncService";

export const useLikesSync = (enabled: boolean = false) => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const uid = user?.uid;

  useEffect(() => {
    // 1. Guard against unready state, disabled flag, or active sync
    if (!enabled || !uid || isSyncRunningRef.current) return;

    let isMounted = true;

    const runLikesSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await syncLikes(uid);
      } catch (error) {
        if (isMounted) {
          console.error("[useLikesSync] Likes background sync failed:", error);
        }
      } finally {
        isSyncRunningRef.current = false;
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    runLikesSync();

    return () => {
      isMounted = false;
    };
  }, [enabled, uid]);

  return { isSyncing };
};
