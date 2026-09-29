import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { saveUser } from "../services/userService";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/features/profile/context/ProfileContext";

interface UserInfoFormData {
  fullName: string;
  mobileNumber: string;
  gender: "male" | "female" | "";
}

export const useUserInfoFlow = () => {
  const { t } = useTranslation();
  const { user, setGender } = useAuth();
  const { setMyProfile } = useMyProfile();
  const [isLoading, setIsLoading] = useState(false);

  const executeProfileSetup = async (data: UserInfoFormData) => {
    if (!user?.uid) return;
    setIsLoading(true);

    try {
      await saveUser(user.uid, data);

      setMyProfile((prev) => ({ ...prev, gender: data.gender }));

      setGender(data.gender);

      Alert.alert(
        t("userInfo.done", "Success"),
        t("userInfo.successMsg", "Profile created successfully!"),
      );
    } catch (error) {
      console.error("❌ [USER_INFO_DIRECT_FIRESTORE_ERROR]:", error);
      Alert.alert(
        t("common.error"),
        t(
          "userInfo.updateError",
          "Failed to save records directly to database.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    executeProfileSetup,
  };
};
