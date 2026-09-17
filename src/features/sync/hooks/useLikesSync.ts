import { useEffect, useRef, useState } from "react";
import { useAuth, useEntitlement } from "@/context";
import { syncLikes } from "../services/likesSyncService";

export const useLikesSync = (enabled: boolean = false) => {
  const { user } = useAuth();
  const { isPaid } = useEntitlement();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const uid = user?.uid;

  useEffect(() => {
    if (!enabled || !uid || !isPaid || isSyncRunningRef.current) return;

    let isMounted = true;

    const runLikesSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await syncLikes(uid, { isPaid });
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
  }, [enabled, uid, isPaid]);

  return { isSyncing };
};
