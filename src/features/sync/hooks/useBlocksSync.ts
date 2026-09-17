import { useEffect, useRef, useState } from "react";
import { useAuth, useEntitlement } from "@/context";
import { syncBlocks } from "../services/blocksSyncService";

export const useBlocksSync = (enabled: boolean = false) => {
  const { user } = useAuth();
  const { isPaid } = useEntitlement();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncRunningRef = useRef<boolean>(false);

  const uid = user?.uid;

  useEffect(() => {
    // 1. Guard against unready state, disabled flag, unpaid entitlement, or active sync
    if (!enabled || !uid || !isPaid || isSyncRunningRef.current) return;

    let isMounted = true;

    const runBlocksSync = async () => {
      isSyncRunningRef.current = true;
      setIsSyncing(true);

      try {
        await syncBlocks(uid, { isPaid });
      } catch (error) {
        if (isMounted) {
          console.error(
            "[useBlocksSync] Blocks background sync failed:",
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

    runBlocksSync();

    return () => {
      isMounted = false;
    };
  }, [enabled, uid, isPaid]);

  return { isSyncing };
};
