import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import {
  auth,
  firestore,
  firestoreServerTimestamp,
  doc,
  setDoc,
  updateProfile,
  reload,
} from "@/config/firebase"; // Adjust import path to match your layout folder structure
import { useAuth } from "../../../context/AuthContext";

interface UserInfoFormData {
  fullName: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "";
}

export const useUserInfoFlow = () => {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const executeProfileSetup = async (data: UserInfoFormData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsLoading(true);

    try {
      // 🌟 STEP 1: Pass your pre-configured native `firestore` instance as the first argument
      const userDocRef = doc(firestore, "users", currentUser.uid);
      let ts = firestoreServerTimestamp(); // Use server timestamp for consistency across devices

      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          phoneNumber: data.mobileNumber,
          fullName: data.fullName,
          gender: data.gender,
          updatedAt: ts,
          createdAt: ts,
        },
        { merge: true },
      ); // Merge flags ensure existing profile objects do not accidentally delete

      // 🌟 STEP 2: Update native Firebase Auth profile parameters
      await updateProfile(currentUser, { displayName: data.gender });

      // 🌟 STEP 3: Refresh local session metadata states
      await reload(currentUser);
      const updatedUser = auth.currentUser;

      if (updatedUser) {
        // 🌟 STEP 4: Update universal application context profile container state
        setUser(updatedUser);
        Alert.alert(
          t("userInfo.done", "Success"),
          t("userInfo.successMsg", "Profile created successfully!"),
        );
      }
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
