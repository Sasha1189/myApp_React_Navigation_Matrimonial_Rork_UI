import { useEffect } from "react";
import { Alert } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useAuth } from "@/context/AuthContext";
import { GOOGLE_REVIEWER_UIDS } from "../../../config/securityConfig";

export const useDeviceBinding = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;

    const verifyDeviceBinding = async () => {
      try {
        // Skip strict device checks for official app reviewer UIDs
        if (GOOGLE_REVIEWER_UIDS.includes(user.uid)) {
          console.log(
            "[useDeviceBinding] Skipping device verification for reviewer UID:",
            user.uid,
          );
          return;
        }

        const deviceId = await DeviceInfo.getUniqueId();

        // TODO: Replace with your actual backend or Firestore verification call
        // const storedDeviceId = await fetchUserBoundDeviceId(user.uid);
        const storedDeviceId = deviceId; // Placeholder comparison logic

        if (storedDeviceId && storedDeviceId !== deviceId) {
          Alert.alert(
            "Security Violation",
            "This account is bound to another physical device. You will be logged out.",
            [{ text: "OK", onPress: () => logout() }],
          );
        }
      } catch (error) {
        console.error(
          "[useDeviceBinding] Failed to verify device binding:",
          error,
        );
      }
    };

    verifyDeviceBinding();
  }, [user, logout]);
};
