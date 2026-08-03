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

  const handleBackPress = () => {
    navigation.goBack();
  };

  return {
    isLoading,
    executeRegistration,
    handleBackPress,
  };
}
