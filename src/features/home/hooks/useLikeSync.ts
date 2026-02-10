import { useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { LikePendingStore } from "../../../cache/likePendingStore";
import { syncLikesBatch } from "../apis/likeApis";

export function useLikeSync(uid: string) {
  const attemptSync = useCallback(async () => {
    const pending = LikePendingStore.get(uid);

    if (pending.length === 0) return;

    try {
      await syncLikesBatch(uid, pending);
      LikePendingStore.remove(uid, pending);
      console.log(`✅ Synced ${pending.length} likes to Firestore`);
    } catch (error) {
      console.warn("Retrying like sync later...");
    }
  }, [uid]);

  useEffect(() => {
    // 1. Sync on Mount
    console.log("Fired on mount");
    attemptSync();

    // 2. Sync on AppState Change
    const subscription = AppState.addEventListener(
      "change",
      (nextStatus: AppStateStatus) => {
        if (nextStatus === "background" || nextStatus === "inactive") {
          console.log("Fired on backgroung");
          attemptSync();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [uid, attemptSync]);

  return { forceSync: attemptSync };
}
