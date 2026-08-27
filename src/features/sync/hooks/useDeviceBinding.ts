import { useEffect } from "react";
import { Alert } from "react-native";
import { getUniqueId } from "react-native-device-info";
import { useAuth } from "@/context/AuthContext";
import {
  appStorage,
  TIER_CACHE_KEY,
  getDBDeviceIdCache,
  setDBDeviceIdCache,
} from "@/cacheMMKV/cacheConfig";
import { GOOGLE_REVIEWER_UIDS } from "../../../config/securityConfig";
import { logoutUser } from "@/context/services/logoutUser";
import {
  getUserDeviceId,
  updateUserDeviceId,
} from "../services/deviceBindingService";

export const useDeviceBinding = (enabled: boolean = false) => {
  const { user, tier } = useAuth();

  useEffect(() => {
    // 1. Early exit if disabled or essential user identity is missing
    if (!enabled || !user?.uid) return;

    const verifyDeviceBinding = async () => {
      try {
        if (GOOGLE_REVIEWER_UIDS.includes(user.uid)) return;

        const isPaidUser = tier === "basic" || tier === "premium";
        if (!user.displayName || !isPaidUser) return;

        const currentHardwareId = await getUniqueId();
        const cachedId = getDBDeviceIdCache();

        if (cachedId === currentHardwareId) return;

        const dbId = await getUserDeviceId(user.uid);

        if (!dbId || dbId.trim() === "") {
          await updateUserDeviceId(user.uid, currentHardwareId);
          setDBDeviceIdCache(currentHardwareId);
          return;
        }

        if (dbId !== currentHardwareId) {
          Alert.alert(
            "Device Mismatch",
            "This account is registered on another device. Contact support.",
            [
              {
                text: "Logout",
                onPress: () => logoutUser(user.uid),
              },
            ],
            { cancelable: false },
          );
        } else {
          setDBDeviceIdCache(dbId);
        }
      } catch (error) {
        console.error(
          "[useDeviceBinding] Failed to verify device binding:",
          error,
        );
      }
    };

    verifyDeviceBinding();
  }, [user?.uid, tier]);
};
