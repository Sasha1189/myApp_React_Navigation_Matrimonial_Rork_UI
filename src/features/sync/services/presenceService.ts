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
} from "@react-native-firebase/database";
import { rtdb } from "@/config/firebase";

export const presenceService = {
  activateSocket: (): void => {
    try {
      goOnline(rtdb);
    } catch (err) {
      console.error("[presenceService] Failed to activate socket:", err);
    }
  },

  deactivateSocket: (): void => {
    try {
      goOffline(rtdb);
    } catch (err) {
      console.error("[presenceService] Failed to deactivate socket:", err);
    }
  },

  setInboxSync: (uid: string, enabled: boolean): void => {
    try {
      const inboxRef = ref(rtdb, `inbox/${uid}`);
      keepSynced(inboxRef, enabled);
    } catch (err) {
      console.error(
        `[presenceService] Failed setting inbox sync to ${enabled}:`,
        err,
      );
    }
  },

  setUserStatus: async (
    uid: string,
    state: "online" | "offline",
  ): Promise<void> => {
    const myStatusRef = ref(rtdb, `/status/${uid}`);
    await update(myStatusRef, {
      state,
      lastChanged: serverTimestamp(),
    });
  },

  setupPresenceListener: (uid: string): (() => void) => {
    const connectedRef = ref(rtdb, ".info/connected");
    const myStatusRef = ref(rtdb, `/status/${uid}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
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
            console.error(
              "[presenceService] Presence execution tracking failed:",
              err,
            ),
          );
      }
    });

    return () => {
      unsubscribe();
      try {
        onDisconnect(myStatusRef).cancel();
      } catch (err) {
        console.error(
          "[presenceService] Error clearing onDisconnect listener:",
          err,
        );
      }
    };
  },
};
