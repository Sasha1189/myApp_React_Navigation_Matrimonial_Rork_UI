import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";

export const useLoginEmail = () => {
  const { t } = useTranslation();
  const authInstance = getAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 CONNECTS DIRECTLY TO REACT-HOOK-FORM SUBMIT
  const executeLogin = async (formData: any) => {
    const { email, password } = formData;
    setIsLoading(true);

    try {
      // 1. Pure, native standard Firebase authentication login pass
      await signInWithEmailAndPassword(
        authInstance,
        email.toLowerCase().trim(),
        password,
      );
    } catch (error: any) {
      console.log("ℹ️ [Auth Flow]: SignIn rejected. Code:", error.code);

      // 2. Clear, distinct production error routing loops
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert(
          t("common.error", "Error"),
          t(
            "auth.accountDoesNotExist",
            "This account does not exist. Please Sign Up first.",
          ),
        );
      } else if (error.code === "auth/wrong-password") {
        Alert.alert(
          t("common.error", "Error"),
          t("auth.incorrectPassword", "Incorrect password. Please try again."),
        );
      } else if (error.code === "auth/user-disabled") {
        Alert.alert(
          t("common.error", "Error"),
          t("auth.userDisabled", "This account has been disabled."),
        );
      } else {
        Alert.alert(
          t("common.error", "Error"),
          error.message || t("auth.failed", "Authentication failed."),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 THE FIXED FORGOT PASSWORD METHOD WITH CONFIRMATION ALERT
  const handleForgotPassword = async (currentEmailValue?: string) => {
    // 1. Core input structural check validation
    if (!currentEmailValue || !/^\S+@\S+$/i.test(currentEmailValue)) {
      Alert.alert(
        t("common.error", "Error"),
        t(
          "auth.enterValidEmailForReset",
          "Please enter a valid email address first to reset your password."
        )
      );
      return;
    }

    const cleanEmail = currentEmailValue.toLowerCase().trim();

    // 2. 🎯 SHOW INTERACTIVE CONFIRMATION MODAL WINDOW
    Alert.alert(
      t("auth.resetConfirmTitle", "Confirm Reset"),
      // Dynamically displays the typed email right inside the message content
      `${t("auth.resetConfirmMsg", "We will send a password reset link to:")}\n\n${cleanEmail}`,
      [
        {
          text: t("auth.helpAlertCancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("auth.helpAlertBtn", "OK"),
          // 3. 🎯 ONLY EXECUTED IF USER CLICKS OK NATIVELY
          onPress: async () => {
            setIsLoading(true);
            try {
              await sendPasswordResetEmail(authInstance, cleanEmail);
              
              Alert.alert(
                t("auth.successTitle", "Success"),
                t(
                  "auth.passwordResetSent",
                  "A password reset link has been sent to your email inbox."
                )
              );
            } catch (error: any) {
              console.error("Password reset failure after OK tap:", error);
              Alert.alert(
                t("common.error", "Error"),
                error.message || "Failed to process password reset request."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return {
    isLoading,
    executeLogin,
    handleForgotPassword,
  };
};
