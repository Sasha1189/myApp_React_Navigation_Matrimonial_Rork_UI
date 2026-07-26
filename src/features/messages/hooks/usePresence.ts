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
// 🎯 Added doc and getDoc imports for Firestore syncing
import { doc, getDoc, firestore, rtdb } from "../../../config/firebase";
import { LikesCache, BlocksCache, storage } from "../../../cache/cacheConfig";

export const usePresence = (
  uid: string | undefined,
  tier: "none" | "basic" | "premium",
  gender: string | undefined | null,
) => {
  useEffect(() => {
    if (!uid) return;

    // 1. 🛡️ STRICT EXCLUSIVITY LOCK: Verify premium tier permissions
    const isPaidUser = tier === "basic" || tier === "premium";

    if (!isPaidUser) {
      // 🎯 FORCE CLEANUP: Wipe both message cache and blocked lists for free users
      BlocksCache.sync([], []);
      goOffline(rtdb);
      return;
    }

    // 2. Validate that registration setup gender details are present
    if (!gender) {
      return;
    }

    // Wake up the database socket layer immediately for premium users
    try {
      goOnline(rtdb);
    } catch (err) {
      console.error("Failed to execute goOnline socket activation:", err);
    }

    let unsubConnection: (() => void) | undefined;
    let appStateSub: { remove: () => void } | undefined;

    const inboxRef = ref(rtdb, `inbox/${uid}`);
    const myStatusRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");

    // Start background sync allocations
    keepSynced(inboxRef, true);

    // 🎯 3. UNIFIED BACKGROUND SYNC PIPELINE (Firestore Blocks & RTDB Likes)
    const initializePremiumCaches = async () => {
      try {
        // A. Synchronize Premium Blocked List from Firestore [1]

        const blockDocRef = doc(firestore, "blockedIDs", uid);
        const blockSnap = await getDoc(blockDocRef);

        if (blockSnap.exists()) {
          const data = blockSnap.data();
          BlocksCache.sync(data?.mine || [], data?.theirs || []);
        } else {
          BlocksCache.sync([], []);
        }

        // B. Sync Liked IDs from RTDB (Only if local cache is empty)
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
      } catch (err) {
        console.error(
          "❌ [Presence Hook]: Critical background sync initialization failed:",
          err,
        );
      }
    };

    initializePremiumCaches();

    // 4. Live Diagnostic Connection Logging & Status Heartbeat
    unsubConnection = onValue(connectedRef, (snap) => {
      const isConnected = snap.val() === true;

      if (isConnected) {
        onDisconnect(myStatusRef)
          .set({ state: "offline", lastChanged: serverTimestamp() })
          .then(() => {
            set(myStatusRef, {
              state: "online",
              lastChanged: serverTimestamp(),
            });
          })
          .catch((err) =>
            console.error("Presence execution tracking failed:", err),
          );
      } else {
      }
    });

    // 5. AppState Lifecycle Listener
    const handleAppState = async (nextAppState: AppStateStatus) => {
      try {
        if (nextAppState === "active") {
          goOnline(rtdb);
          await update(myStatusRef, {
            state: "online",
            lastChanged: serverTimestamp(),
          });
        } else if (nextAppState === "background") {
          await update(myStatusRef, {
            state: "offline",
            lastChanged: serverTimestamp(),
          });
          goOffline(rtdb);
        }
      } catch (lifecycleErr) {
        console.error(
          "AppState status lifecycle update rejected:",
          lifecycleErr,
        );
      }
    };

    appStateSub = AppState.addEventListener("change", handleAppState);

    // Clean up all listeners and reset security arrays on unmount/logout
    return () => {
      if (unsubConnection) unsubConnection();
      if (appStateSub) appStateSub.remove();

      try {
        keepSynced(inboxRef, false);
        onDisconnect(myStatusRef).cancel();
      } catch (cleanUpErr) {
        console.error("Error clearing cleanup variables:", cleanUpErr);
      }
    };
  }, [uid, tier, gender]);
};
