import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
  update,
  goOnline,
  goOffline,
  keepSynced,
  query,
  limitToLast,
  get,
} from "@react-native-firebase/database";
import { rtdb } from "../../../config/firebase";
import { LikesCache, storage } from "../../../cache/cacheConfig";

export const usePresence = (uid: string | undefined) => {
  useEffect(() => {
    if (!uid) return;

    // Local refs for cleanup
    let unsubConnection: (() => void) | undefined;
    let appStateSub: { remove: () => void } | undefined;
    const inboxRef = ref(rtdb, `inbox/${uid}`);
    const myStatusRef = ref(rtdb, `/status/${uid}`);

    const timer = setTimeout(async () => {
      // 1. Heavy Sync Logic (Syncs inbox to disk for 0ms offline loading)
      keepSynced(inboxRef, true);

      // 2. Sync Liked IDs (Only if local cache is empty)
      if (LikesCache.getIds().length === 0) {
        const likesSentRef = query(
          ref(rtdb, `likesSent/${uid}`),
          limitToLast(1000),
        );
        const snap = await get(likesSentRef);
        if (snap.exists()) {
          storage.set(
            "likes_ids_index",
            JSON.stringify(Object.keys(snap.val())),
          );
        }
      }

      // 3. Presence Listener (Tracks online/offline status)
      const connectedRef = ref(rtdb, ".info/connected");
      unsubConnection = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(myStatusRef)
            .set({ state: "offline", lastChanged: serverTimestamp() })
            .then(() =>
              set(myStatusRef, {
                state: "online",
                lastChanged: serverTimestamp(),
              }),
            );
        }
      });

      // 4. AppState Listener (Saves bandwidth when app is hidden)
      const handleAppState = async (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          goOnline(rtdb);
          update(myStatusRef, {
            state: "online",
            lastChanged: serverTimestamp(),
          });
        } else if (nextAppState === "background") {
          // No notifications required: Kill connection to save 100% data
          await update(myStatusRef, {
            state: "offline",
            lastChanged: serverTimestamp(),
          });
          goOffline(rtdb);
        }
      };
      appStateSub = AppState.addEventListener("change", handleAppState);
    }, 2000); // Startup delay

    return () => {
      clearTimeout(timer);
      if (unsubConnection) unsubConnection();
      if (appStateSub) appStateSub.remove();

      keepSynced(inboxRef, false);

      onDisconnect(myStatusRef).cancel();
    };
  }, [uid]);
};
