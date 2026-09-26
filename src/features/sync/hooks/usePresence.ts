import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@/context";
import { presenceService } from "../services/presenceService";

export const usePresence = (enabled: boolean = false) => {
  const { user, isPaid } = useAuth();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const uid = user?.uid;

  useEffect(() => {
    if (!enabled || !uid || !isPaid) return;

    const cleanupPresenceListener = presenceService.setupPresenceListener(uid);

    // 3. AppState lifecycle listener
    const handleAppState = (nextAppState: AppStateStatus) => {
      const currentAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        currentAppState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Turning socket on triggers .info/connected listener -> sets user 'online'
        presenceService.activateSocket();
      }

      if (
        currentAppState === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // Turning socket off triggers server-side onDisconnect hook automatically
        presenceService.deactivateSocket();
      }
    };

    const appStateSub = AppState.addEventListener("change", handleAppState);

    // 4. Cleanup on unmount or identity/enabled status change
    return () => {
      appStateSub.remove();
      cleanupPresenceListener();
    };
  }, [enabled, uid, isPaid]);
};
