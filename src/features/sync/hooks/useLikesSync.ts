import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncLikes } from "../services/likesSyncService";

export const useLikesSync = (enabled: boolean = false) => {
  const { user } = useAuth();

  useEffect(() => {
    // 1. Early exit if disabled or essential user identity is missing
    if (!enabled || !user?.uid) return;

    let isMounted = true;

    const runLikesSync = async () => {
      try {
        await Promise.all([syncLikes(user.uid)]);

        if (isMounted) {
          console.log(
            "[useLikesSync] Likes sync cycle completed successfully.",
          );
        }
      } catch (error) {
        console.error("[useLikesSync] Likes background sync failed:", error);
      }
    };

    runLikesSync();

    return () => {
      isMounted = false;
    };
  }, [enabled, user?.uid]);
};
