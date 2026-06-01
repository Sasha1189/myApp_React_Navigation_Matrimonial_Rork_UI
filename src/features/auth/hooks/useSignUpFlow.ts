import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import { useAuthNavigation } from "../../../navigation/hooks";

export function useSignUpFlow() {
  const { t } = useTranslation();
  const navigation = useAuthNavigation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUpSubmit = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert(
        t("common.error"),
        "Please enter a valid 10-digit phone number",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        t("common.error"),
        t("auth.passwordMismatch", "Passwords do not match."),
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        t("common.error"),
        t("auth.passwordTooShort", "Password must be at least 6 characters."),
      );
      return;
    }

    setIsLoading(true);
    const dummyEmail = `+91${phoneNumber}@lonariyuvaconnect.com`;

    try {
      // 👑 UPDATE 2: Fetch the active auth instance module
      const firebaseAuth = getAuth();

      // 👑 UPDATE 3: Execute using clean modular function boundaries
      await createUserWithEmailAndPassword(firebaseAuth, dummyEmail, password);

      Alert.alert(
        t("auth.successTitle", "Success"),
        t("auth.registrationComplete", "Registration completed successfully!"),
      );
    } catch (error: any) {
      console.error("Account registration failure: ", error);
      let msg = error.message;

      if (error.code === "auth/email-already-in-use") {
        msg = t(
          "auth.duplicateEmailError",
          "This mobile number is already registered.",
        );
      }

      Alert.alert("Registration Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isButtonDisabled =
    phoneNumber.length < 10 ||
    password.length < 6 ||
    confirmPassword.length < 6 ||
    isLoading;

  return {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleSignUpSubmit,
    handleBackPress,
    isButtonDisabled,
  };
}
