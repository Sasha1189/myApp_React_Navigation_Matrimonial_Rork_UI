import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncBlocks } from "../services/blocksSyncService";

export const useBlocksSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

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
  }, [user?.uid]);
};
