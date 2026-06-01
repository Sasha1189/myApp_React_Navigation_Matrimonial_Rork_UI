import { useState, useEffect, useRef } from "react";
import { TextInput, Keyboard, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import { useAuthNavigation } from "../../../navigation/hooks";

export const CODE_LENGTH = 6;
export const RESEND_TIME = 60;

export function useSignUpFlow(initialPhone: string = "") {
  const { t } = useTranslation();
  const navigation = useAuthNavigation();

  const [step, setStep] = useState<"PHONE_INPUT" | "OTP_VERIFY">(
    initialPhone ? "OTP_VERIFY" : "PHONE_INPUT",
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpArray, setOtpArray] = useState<string[]>(
    new Array(CODE_LENGTH).fill(""),
  );

  // 👑 REINFORCEMENT 1: Start timer constraint at 0 if initialPhone arrives so 'Get OTP' button is ready for manual tap
  const [timer, setTimer] = useState(initialPhone ? 0 : RESEND_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown tracking
  useEffect(() => {
    if (step !== "OTP_VERIFY" || timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  // Auto-submit OTP when completely filled
  useEffect(() => {
    const fullOtp = otpArray.join("");
    // 👑 REINFORCEMENT 2: Added explicit verificationId check guard
    // This physically blocks auto-submissions from running verification scripts before an SMS is generated!
    if (
      fullOtp.length === CODE_LENGTH &&
      step === "OTP_VERIFY" &&
      verificationId
    ) {
      Keyboard.dismiss();
      handleVerifyAndLink(fullOtp);
    }
  }, [otpArray, verificationId]);

  // Phase 1 execution: Spawns your permanent dummy email account profile FIRST
  const handleInitialSignUp = async () => {
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
      // Step 1: Create the base email/password account natively
      await auth().createUserWithEmailAndPassword(dummyEmail, password);

      // Step 2: Transition into view step without generating an alternate phone auth record
      setStep("OTP_VERIFY");
      setTimer(0); // Instantly unlocks 'Get OTP' text on UI
    } catch (error: any) {
      console.error("Initial account configuration failure: ", error);
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

  const sendSmsVerificationOnly = async () => {
    const fullPhone = `+91${phoneNumber}`;

    return new Promise<void>((resolve, reject) => {
      auth()
        .verifyPhoneNumber(fullPhone)
        .on(
          "state_changed",
          (phoneAuthSnapshot) => {
            if (phoneAuthSnapshot.verificationId) {
              setVerificationId(phoneAuthSnapshot.verificationId);
              resolve();
            }
          },
          (error) => {
            console.error("SMS Delivery Fault: ", error);
            Alert.alert("Failed to send OTP", error?.message ?? undefined);
            reject(error);
          },
        );
    });
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) return;

    setIsLoading(true);
    try {
      await sendSmsVerificationOnly();
      setTimer(RESEND_TIME);
      Alert.alert("OTP Sent", "A new verification code has been dispatched.");
    } catch (error: any) {
      console.error("Manual sending process exception error context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLink = async (forcedOtp?: string) => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      Alert.alert("Error", "User session expired. Please restart the app.");
      return;
    }

    const codeToVerify = forcedOtp || otpArray.join("");
    if (!verificationId || codeToVerify.length < CODE_LENGTH) return;

    setIsLoading(true);
    try {
      const phoneCredential = auth.PhoneAuthProvider.credential(
        verificationId,
        codeToVerify,
      );

      await currentUser.linkWithCredential(phoneCredential);

      Alert.alert(
        t("auth.successTitle", "Success"),
        t("auth.registrationComplete", "Registration completed successfully!"),
      );

      await currentUser.getIdToken(true);
    } catch (error: any) {
      console.error("Linking structural pipeline fault error: ", error);

      if (error.code === "auth/credential-already-in-use") {
        await currentUser.getIdToken(true);
        return;
      }

      let msg = t("auth.genericError");
      if (error?.code === "auth/invalid-verification-code")
        msg = t("auth.invalidOtp");
      else if (error?.code === "auth/session-expired")
        msg = t("auth.otpExpired");
      Alert.alert(t("common.error"), msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otpArray];
    newOtp[index] = cleanText;
    setOtpArray(newOtp);

    if (cleanText && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackPress = () => {
    if (step === "OTP_VERIFY") {
      setStep("PHONE_INPUT");
      setOtpArray(new Array(CODE_LENGTH).fill(""));
      setVerificationId(null); // Clear ID token values on step reset backtracks
    } else {
      navigation.goBack();
    }
  };

  const isButtonDisabled =
    step === "PHONE_INPUT"
      ? phoneNumber.length < 10 ||
        password.length < 6 ||
        confirmPassword.length < 6 ||
        isLoading
      : otpArray.join("").length < CODE_LENGTH || !verificationId || isLoading; // 👑 REINFORCEMENT 3: Disable button if SMS hasn't generated yet

  return {
    step,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otpArray,
    timer,
    isLoading,
    inputRefs,
    handleSendOtp,
    handleVerifyAndLink,
    handleOtpChange,
    handleOtpKeyPress,
    handleBackPress,
    isButtonDisabled,
    handleInitialSignUp,
  };
}
