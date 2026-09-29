import {
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
  goOnline,
  goOffline,
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

  setupPresenceListener: (uid: string): (() => void) => {
    const connectedRef = ref(rtdb, ".info/connected");
    const myStatusRef = ref(rtdb, `/status/${uid}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      const isConnected = snap.val() === true;

      if (isConnected) {
        // Register server-side trigger upon unexpected or controlled disconnect
        onDisconnect(myStatusRef)
          .set({ st: "of", lc: serverTimestamp() })
          .then(() => {
            // Set client status to online once onDisconnect listener is guaranteed active
            set(myStatusRef, {
              st: "on", //state:"online"
              lc: serverTimestamp(), //lastChanged
            });
          })
          .catch((err) =>
            console.error(
              "[presenceService] Failed registering onDisconnect trigger:",
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
