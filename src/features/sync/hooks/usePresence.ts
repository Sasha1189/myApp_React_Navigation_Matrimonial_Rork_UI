import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { presenceService } from "../services/presenceService";

export const usePresence = (
  uid: string | undefined,
  tier: "none" | "basic" | "premium",
  gender: string | undefined | null,
) => {
  useEffect(() => {
    if (!uid) return;

    const isPaidUser = tier === "basic" || tier === "premium";

    if (!isPaidUser) {
      presenceService.deactivateSocket();
      return;
    }

    if (!gender) {
      return;
    }

    // 1. Wake up socket & sync inbox
    presenceService.activateSocket();
    presenceService.setInboxSync(uid, true);

    // 2. Attach presence listener
    const cleanupPresenceListener = presenceService.setupPresenceListener(uid);

    // 3. Attach AppState lifecycle listener
    const handleAppState = async (nextAppState: AppStateStatus) => {
      try {
        if (nextAppState === "active") {
          presenceService.activateSocket();
          await presenceService.setUserStatus(uid, "online");
        } else if (nextAppState === "background") {
          await presenceService.setUserStatus(uid, "offline");
          presenceService.deactivateSocket();
        }
      } catch (lifecycleErr) {
        console.error(
          "[usePresence] AppState lifecycle update rejected:",
          lifecycleErr,
        );
      }
    };

    const appStateSub = AppState.addEventListener("change", handleAppState);

    // 4. Cleanup on unmount or user change
    return () => {
      cleanupPresenceListener();
      appStateSub.remove();
      presenceService.setInboxSync(uid, false);
    };
  }, [uid, tier, gender]);
};
