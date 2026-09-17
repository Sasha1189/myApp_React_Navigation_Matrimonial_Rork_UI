import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { getUniqueId } from "react-native-device-info";
import { useAuth, useEntitlement } from "@/context";
import {
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
  const { user, setAuthLoading } = useAuth();
  const { isPaid, isPaidTier } = useEntitlement();

  const isVerifyingRef = useRef<boolean>(false);

  const uid = user?.uid;
  const displayName = user?.displayName;

  useEffect(() => {
    if (!enabled || !isPaid || !isPaidTier || !uid || !displayName) return;

    if ((GOOGLE_REVIEWER_UIDS ?? []).includes(uid)) return;

    if (isVerifyingRef.current) return;

    let isMounted = true;

    const verifyDeviceBinding = async () => {
      isVerifyingRef.current = true;

      try {
        const currentHardwareId = await getUniqueId();
        const cachedId = getDBDeviceIdCache();

        if (cachedId === currentHardwareId) return;

        const dbId = await getUserDeviceId(uid);

        if (!isMounted) return;

        // Register device if first time binding
        if (!dbId || dbId.trim() === "") {
          await updateUserDeviceId(uid, currentHardwareId);
          if (isMounted) {
            setDBDeviceIdCache(currentHardwareId);
          }
          return;
        }

        // Validate hardware match
        if (dbId !== currentHardwareId) {
          Alert.alert(
            "Device Mismatch",
            "This account is registered on another device. Contact support.",
            [
              {
                text: "Logout",
                onPress: () => logoutUser({ uid, setAuthLoading }),
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
      } finally {
        isVerifyingRef.current = false;
      }
    };

    verifyDeviceBinding();

    return () => {
      isMounted = false;
    };
  }, [enabled, uid, isPaid, isPaidTier]);
};
