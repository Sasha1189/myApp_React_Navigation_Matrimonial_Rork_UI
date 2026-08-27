import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncBlocks } from "../services/blocksSyncService";

export const useBlocksSync = (enabled: boolean = false) => {
  const { user } = useAuth();

  useEffect(() => {
    // 1. Early exit if disabled or essential user identity is missing
    if (!enabled || !user?.uid) return;

    let isMounted = true;

    const runBlocksSync = async () => {
      try {
        await Promise.all([syncBlocks(user.uid)]);

        if (isMounted) {
          console.log(
            "[useBlocksSync] Blocks sync cycle completed successfully.",
          );
        }
      } catch (error) {
        console.error("[useBlocksSync] Blocks background sync failed:", error);
      }
    };

    runBlocksSync();

    return () => {
      isMounted = false;
    };
  }, [enabled, user?.uid]);
};
