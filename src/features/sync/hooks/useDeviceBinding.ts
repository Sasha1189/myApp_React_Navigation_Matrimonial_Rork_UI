// import { useEffect } from "react";
// import { Alert } from "react-native";
// import { getUniqueId } from "react-native-device-info";
// import { useAuth } from "@/context/AuthContext";
// import {
//   appStorage,
//   TIER_CACHE_KEY,
//   getDBDeviceIdCache,
//   setDBDeviceIdCache,
// } from "@/cacheMMKV/cacheConfig";
// import { GOOGLE_REVIEWER_UIDS } from "../../../config/securityConfig";
// import { logoutUser } from "@/context/services/logoutUser";
// import {
//   getUserDeviceId,
//   updateUserDeviceId,
// } from "../services/deviceBindingService";

// export const useDeviceBinding = (enabled: boolean = false) => {
//   const { user, tier } = useAuth();

//   useEffect(() => {
//     if (!enabled || !user?.uid) return;

//     const verifyDeviceBinding = async () => {
//       try {
//         if (GOOGLE_REVIEWER_UIDS.includes(user.uid)) return;

//         const isPaidUser = tier === "basic" || tier === "premium";
//         if (!user.displayName || !isPaidUser) return;

//         const currentHardwareId = await getUniqueId();
//         const cachedId = getDBDeviceIdCache();

//         if (cachedId === currentHardwareId) return;

//         const dbId = await getUserDeviceId(user.uid);

//         if (!dbId || dbId.trim() === "") {
//           await updateUserDeviceId(user.uid, currentHardwareId);
//           setDBDeviceIdCache(currentHardwareId);
//           return;
//         }

//         if (dbId !== currentHardwareId) {
//           Alert.alert(
//             "Device Mismatch",
//             "This account is registered on another device. Contact support.",
//             [
//               {
//                 text: "Logout",
//                 onPress: () => logoutUser(user.uid),
//               },
//             ],
//             { cancelable: false },
//           );
//         } else {
//           setDBDeviceIdCache(dbId);
//         }
//       } catch (error) {
//         console.error(
//           "[useDeviceBinding] Failed to verify device binding:",
//           error,
//         );
//       }
//     };

//     verifyDeviceBinding();
//   }, [user?.uid, tier]);
// };

import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { getUniqueId } from "react-native-device-info";
import { useAuth } from "@/context/AuthContext";
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
  const { user, tier } = useAuth();
  const isVerifyingRef = useRef<boolean>(false);

  const uid = user?.uid;
  const displayName = user?.displayName;
  const isPaidUser = tier === "basic" || tier === "premium";

  useEffect(() => {
    // 1. Guard against unready state, disabled flag, or non-paid tier
    if (!enabled || !uid || !displayName || !isPaidUser) return;

    // 2. Bypass hardware check for reviewer accounts
    if (GOOGLE_REVIEWER_UIDS.includes(uid)) return;

    // 3. Prevent parallel execution if a check is already in-flight
    if (isVerifyingRef.current) return;

    let isMounted = true;

    const verifyDeviceBinding = async () => {
      isVerifyingRef.current = true;

      try {
        const currentHardwareId = await getUniqueId();
        const cachedId = getDBDeviceIdCache();

        // Fast-path: Skip network query if MMKV cache matches current device
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
                onPress: () => logoutUser(uid),
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
  }, [enabled, uid, displayName, isPaidUser]);
};
