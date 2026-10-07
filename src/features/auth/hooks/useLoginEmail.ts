import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useTranslation } from "react-i18next";

export const useLoginEmail = () => {
  const { t } = useTranslation();
  const authInstance = getAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 EMAIL/PASSWORD LOGIN
  const executeLogin = async (formData: any) => {
    const { email, password } = formData;
    setIsLoading(true);
    console.log("[executeLogin hit]");

    try {
      await signInWithEmailAndPassword(
        authInstance,
        email.toLowerCase().trim(),
        password,
      );
    } catch (error: any) {
      console.log("ℹ️ [Auth Flow]: SignIn rejected. Code:", error.code);

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert(
          t("common.error", "Error"),
          t(
            "auth.accountDoesNotExistOrGoogle",
            "Incorrect credentials. If you registered with Google, please tap 'Sign in with Google'.",
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

  const executeGoogleLogin = async () => {
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const signInResult = await GoogleSignin.signIn();

      let idToken: string | undefined | null = null;

      if (isSuccessResponse(signInResult)) {
        idToken = signInResult.data.idToken;
      }

      if (!idToken) {
        throw new Error("No ID Token returned from Google Sign-In.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseAuth = getAuth();

      await signInWithCredential(firebaseAuth, googleCredential);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled silently, do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Already in progress silently, do nothing
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          t("auth.error", "Google Sign-In Failed"),
          t(
            "auth.playServicesError",
            "Google Play Services are not available or outdated.",
          ),
        );
      } else {
        Alert.alert(
          t("auth.error", "Google Sign-In Failed"),
          error.message ||
            t("auth.genericError", "Failed to sign up with Google."),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 FORGOT PASSWORD METHOD
  const handleForgotPassword = async (currentEmailValue?: string) => {
    if (!currentEmailValue || !/^\S+@\S+$/i.test(currentEmailValue)) {
      Alert.alert(
        t("common.error", "Error"),
        t(
          "auth.enterValidEmailForReset",
          "Please enter a valid email address first to reset your password.",
        ),
      );
      return;
    }

    const cleanEmail = currentEmailValue.toLowerCase().trim();

    Alert.alert(
      t("auth.resetConfirmTitle", "Confirm Reset"),
      `${t("auth.resetConfirmMsg", "We will send a password reset link to:")}\n\n${cleanEmail}`,
      [
        {
          text: t("auth.helpAlertCancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("auth.helpAlertBtn", "OK"),
          onPress: async () => {
            setIsLoading(true);
            try {
              await sendPasswordResetEmail(authInstance, cleanEmail);
              Alert.alert(
                t("auth.successTitle", "Success"),
                t(
                  "auth.passwordResetSent",
                  "A password reset link has been sent to your email inbox.",
                ),
              );
            } catch (error: any) {
              if (error.code === "auth/user-not-found") {
                Alert.alert(
                  t("common.error", "Error"),
                  t(
                    "auth.accountDoesNotExist",
                    "This account does not exist. Please check your email.",
                  ),
                );
              } else {
                Alert.alert(
                  t("common.error", "Error"),
                  error.message ||
                    t(
                      "auth.resetFailed",
                      "Failed to process password reset request.",
                    ),
                );
              }
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return {
    isLoading,
    executeLogin,
    executeGoogleLogin,
    handleForgotPassword,
  };
};
