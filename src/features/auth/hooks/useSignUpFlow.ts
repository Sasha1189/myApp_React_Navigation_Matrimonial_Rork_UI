import { useState } from "react";
import { Alert } from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
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

      // Pure, native Firebase registration
      await createUserWithEmailAndPassword(firebaseAuth, email, password);

      Alert.alert(
        t("auth.successTitle", "Success"),
        t("auth.registrationComplete"),
      );
    } catch (error: any) {
      console.error("Pure email registration failure: ", error);
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

  // 🟢 ADD Google Sign-Up handler inside useSignUpFlow
  // const executeGoogleSignUp = async () => {
  //   setIsLoading(true);

  //   try {
  //     // 1. Check if Play Services are available (Android requirement)
  //     await GoogleSignin.hasPlayServices({
  //       showPlayServicesUpdateDialog: true,
  //     });

  //     // 2. Open Google Auth modal and retrieve token
  //     const signInResult = await GoogleSignin.signIn();
  //     const idToken = signInResult.data?.idToken;

  //     if (!idToken) {
  //       throw new Error("No ID Token returned from Google Sign-In.");
  //     }

  //     // 3. Create Firebase credential using Google ID Token
  //     const googleCredential = GoogleAuthProvider.credential(idToken);

  //     // 4. Complete Firebase Authentication
  //     const firebaseAuth = getAuth();
  //     await signInWithCredential(firebaseAuth, googleCredential);

  //     Alert.alert(
  //       t("auth.successTitle", "Success"),
  //       t(
  //         "auth.registrationComplete",
  //         "Account created successfully with Google.",
  //       ),
  //     );
  //   } catch (error: any) {
  //     console.error("Google registration failure: ", error);
  //     // Ignore user cancellation errors (code 12501 or status 'canceled')
  //     if (error.code !== "12501" && error.statusCodes?.SIGN_IN_CANCELLED) {
  //       Alert.alert(
  //         "Google Sign-In Failed",
  //         error.message || "Failed to sign up with Google.",
  //       );
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return {
    isLoading,
    executeRegistration,
    // executeGoogleSignUp,
    handleBackPress,
  };
}
