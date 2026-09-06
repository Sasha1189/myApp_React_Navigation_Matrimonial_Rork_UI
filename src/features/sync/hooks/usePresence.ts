import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@/context";
import { presenceService } from "../services/presenceService";

export const usePresence = (enabled: boolean = false) => {
  const { user } = useAuth();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const uid = user?.uid;
  const gender = user?.displayName?.trim().toLowerCase();
  const isValidGender = gender === "male" || gender === "female";

  useEffect(() => {
    // 1. Guard against invalid execution states
    if (!enabled || !uid || !isValidGender) return;

    let isEffectActive = true;

    const initializePresence = async () => {
      try {
        presenceService.activateSocket();
        presenceService.setInboxSync(uid, true);

        if (isEffectActive) {
          await presenceService.setUserStatus(uid, "online");
        }
      } catch (err) {
        console.error("[usePresence] Initial online status failed:", err);
      }
    };

    // 2. Attach listeners & activate
    initializePresence();
    const cleanupPresenceListener = presenceService.setupPresenceListener(uid);

    // 3. AppState lifecycle listener with guarded execution order
    const handleAppState = async (nextAppState: AppStateStatus) => {
      const currentAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      try {
        if (
          currentAppState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          presenceService.activateSocket();
          await presenceService.setUserStatus(uid, "online");
        } else if (
          currentAppState === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // Await status dispatch BEFORE closing socket channel
          await presenceService.setUserStatus(uid, "offline").catch(() => {});
          presenceService.deactivateSocket();
        }
      } catch (lifecycleErr) {
        console.error("[usePresence] AppState update failed:", lifecycleErr);
      }
    };

    const appStateSub = AppState.addEventListener("change", handleAppState);

    // 4. Clean cleanup on unmount or identity change
    return () => {
      isEffectActive = false;
      appStateSub.remove();
      cleanupPresenceListener();

      presenceService.setInboxSync(uid, false);
      // Fire-and-forget offline status before closing socket
      presenceService.setUserStatus(uid, "offline").finally(() => {
        presenceService.deactivateSocket();
      });
    };
    // Removed 'tier' and stabilized primitives
  }, [enabled, uid, gender, isValidGender]);
};
