import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useTranslation } from "react-i18next";
import { useAuthNavigation } from "../../../navigation/hooks";

export function useSignUpFlow() {
  const { t } = useTranslation();
  const navigation = useAuthNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const executeRegistration = async (formData: any) => {
    const { email, password } = formData;
    setIsLoading(true);

    try {
      const firebaseAuth = getAuth();
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      Alert.alert(
        t("auth.successTitle", "Success"),
        t("auth.registrationComplete"),
      );
    } catch (error: any) {
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = t(
          "auth.duplicateEmailError",
          "This email address is already registered.",
        );
      }
      Alert.alert("Registration Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const executeGoogleSignUp = async () => {
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  return {
    isLoading,
    executeRegistration,
    executeGoogleSignUp,
    handleBackPress,
  };
}
