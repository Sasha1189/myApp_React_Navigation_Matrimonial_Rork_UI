import { useEffect } from "react";
import { useAuth } from "@/context";
import { AppState, AppStateStatus } from "react-native";
import { presenceService } from "../services/presenceService";

export const usePresence = (enabled: boolean = false) => {
  const { user, tier } = useAuth();
  useEffect(() => {
    // 1. Early exit if disabled or essential user identity is missing
    if (!enabled || !user?.uid) return;

    const userGender = user.displayName?.trim().toLowerCase();
    const isGenderValid = userGender === "male" || userGender === "female";

    if (!isGenderValid) return;

    const uid = user.uid;

    // 1. Wake up socket & sync inbox
    presenceService.activateSocket();
    presenceService.setInboxSync(uid, true);
    presenceService
      .setUserStatus(uid, "online")
      .catch((err) =>
        console.error("[usePresence] Initial online status failed:", err),
      );

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
      presenceService.setUserStatus(uid, "offline").catch(() => {});
      presenceService.deactivateSocket();
    };
  }, [enabled, user?.uid, user?.displayName, tier]);
};
