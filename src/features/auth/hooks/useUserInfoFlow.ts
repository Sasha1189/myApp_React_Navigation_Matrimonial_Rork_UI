import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { createUser, CreateUserPayload } from "../api/userApi";
import { useAuth } from "@/context/AuthContext";
import { setGenderCache } from "@/cacheMMKV/cacheConfig";

interface UserInfoFormData {
  fullName: string;
  mobileNumber: string;
  gender: "male" | "female" | "";
}

export const useUserInfoFlow = () => {
  const { t } = useTranslation();
  const { user, setGender } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const executeProfileSetup = async (data: UserInfoFormData) => {
    if (!user?.uid || !data.gender || !data.mobileNumber) return;
    setIsLoading(true);

    try {
      const payload: CreateUserPayload = {
        uid: user.uid,
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        gender: data.gender,
        email: user.email ?? "",
      };

      await createUser(payload);

      setGenderCache(data.gender);

      setGender(data.gender);

      Alert.alert(
        t("userInfo.done", "Success"),
        t("userInfo.successMsg", "Profile created successfully!"),
      );
    } catch (error) {
      Alert.alert(
        t("common.error"),
        t("userInfo.updateError", "Failed to save records to database."),
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
