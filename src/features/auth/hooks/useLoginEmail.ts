import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export const useLoginEmail = () => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const authInstance = getAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear inputs and drop back to the number selection view window state
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

    // Generate our secure hidden mock email string layout format out from the telephone entry number
    const formattedEmail = `+91${phoneNumber}@lonariyuvaconnect.com`;

    try {
      console.log(
        "🔄 [Auth Flow]: Running unified authentication login check...",
      );

      // 1. Try a standard login profile match check first
      const loginCredential = await signInWithEmailAndPassword(
        authInstance,
        formattedEmail,
        password,
      );

      console.log("✅ [Auth Flow]: Existing user verified. Login successful.");
      setUser(loginCredential.user);
    } catch (error: any) {
      console.log(
        "ℹ️ [Auth Flow]: SignIn rejected. Analyzing exception code:",
        error.code,
      );

      // 2. If the user account does not exist yet on the server, auto-trigger registration instantly
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-disabled"
      ) {
        try {
          console.log(
            "📝 [Auth Flow]: No profile found. Creating a brand-new user record...",
          );

          const signupCredential = await createUserWithEmailAndPassword(
            authInstance,
            formattedEmail,
            password,
          );

          console.log(
            "✅ [Auth Flow]: Auto-Registration complete. Handing off to onboarding stack.",
          );
          setUser(signupCredential.user);
        } catch (signupError: any) {
          console.error(
            "❌ [Auth Flow]: Auto-signup sequence rejected:",
            signupError,
          );
          Alert.alert(
            t("common.error"),
            signupError.message || t("auth.signupFailed"),
          );
        }
      } else if (error.code === "auth/wrong-password") {
        // Explicitly catch incorrect passwords so active accounts are shielded from overwrites
        Alert.alert(
          t("common.error"),
          t("auth.incorrectPassword", {
            defaultValue: "Incorrect password. Please try again.",
          }),
        );
      } else {
        Alert.alert(t("common.error"), error.message || t("auth.failed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Button disabled evaluation parameters
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
  };
};
