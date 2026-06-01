import { useState } from "react";
import { Alert, Linking } from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";

export const useLoginEmail = () => {
  const { t } = useTranslation();
  const authInstance = getAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = () => {
    setPhoneNumber("");
    setPassword("");
  };

  const handleAuthSubmit = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert(t("common.error"), t("auth.invalidPhone"));
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        t("common.error"),
        t("auth.passwordTooShort", {
          defaultValue: "Password must be at least 6 characters.",
        }),
      );
      return;
    }

    setIsLoading(true);
    const formattedEmail = `+91${phoneNumber}@lonariyuvaconnect.com`;

    try {
      console.log(
        "🔄 [Auth Flow]: Running clean authentication login check...",
      );

      // 1. Straightforward login attempt using modern modular API
      await signInWithEmailAndPassword(authInstance, formattedEmail, password);

      console.log("✅ [Auth Flow]: User verified. Login successful.");
    } catch (error: any) {
      console.log("ℹ️ [Auth Flow]: SignIn rejected. Code:", error.code);

      // 2. Clear, distinct error routing loops
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        // Account does not exist in Firebase Console
        Alert.alert(
          t("common.error"),
          t(
            "auth.accountDoesNotExist",
            "This account does not exist. Please Sign Up first.",
          ),
        );
      } else if (error.code === "auth/wrong-password") {
        // Password mismatch protection check
        Alert.alert(
          t("common.error"),
          t("auth.incorrectPassword", "Incorrect password. Please try again."),
        );
      } else if (error.code === "auth/user-disabled") {
        Alert.alert(
          t("common.error"),
          t("auth.userDisabled", "This account has been disabled."),
        );
      } else {
        Alert.alert(t("common.error"), error.message || t("auth.failed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const adminPhoneNumber = "8554840100";
    const whatsappMessage = encodeURIComponent(
      t(
        "auth.forgotPasswordSmsBody",
        "Hello Admin, I forgot my password. Please help me reset it for my registered mobile number.",
      ),
    );

    Alert.alert(
      t("auth.forgotAlertTitle", "Reset Password"),
      t(
        "auth.forgotAlertMessage",
        "Call / Whatsapp admin on 8554840100 from your registered mobile number to reset password.",
      ),
      [
        {
          text: t("auth.forgotAlertCancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("auth.forgotAlertCall", "Call"),
          onPress: () => Linking.openURL(`tel:${adminPhoneNumber}`),
        },
        {
          text: t("auth.forgotAlertWhatsapp", "WhatsApp"),
          style: "default",
          onPress: () =>
            Linking.openURL(
              `https://wa.me{adminPhoneNumber}?text=${whatsappMessage}`,
            ),
        },
      ],
      { cancelable: true },
    );
  };

  const isButtonDisabled = phoneNumber.length !== 10 || password.length < 6;

  return {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    isLoading,
    handleBackPress,
    handleAuthSubmit,
    isButtonDisabled,
    handleForgotPassword,
  };
};
