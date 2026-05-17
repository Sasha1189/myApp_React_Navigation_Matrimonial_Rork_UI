import { useState, useEffect, useRef } from "react";
import { TextInput, Keyboard, Alert } from "react-native";
import {
  getAuth,
  signInWithPhoneNumber,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import { useAuthNavigation } from "../../../navigation/hooks";

export const CODE_LENGTH = 6;
export const RESEND_TIME = 60;

export function useLoginFlow() {
  const { t } = useTranslation();
  const navigation = useAuthNavigation();

  const [step, setStep] = useState<"PHONE_INPUT" | "OTP_VERIFY">("PHONE_INPUT");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpArray, setOtpArray] = useState<string[]>(
    new Array(CODE_LENGTH).fill(""),
  );
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const inputRefs = useRef<TextInput[]>([]);

  // Timer countdown tracking
  useEffect(() => {
    if (step !== "OTP_VERIFY" || timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  // Auto-submit OTP when completely filled
  useEffect(() => {
    const fullOtp = otpArray.join("");
    if (fullOtp.length === CODE_LENGTH && step === "OTP_VERIFY") {
      Keyboard.dismiss();
      handleVerifyOtp(fullOtp);
    }
  }, [otpArray]);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert(
        t("common.error"),
        "Please enter a valid 10-digit phone number",
      );
      return;
    }

    setIsLoading(true);
    const fullPhone = `+91${phoneNumber}`;

    try {
      const auth = getAuth();
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone);
      setConfirmation(confirmationResult);
      setStep("OTP_VERIFY");
      setTimer(RESEND_TIME);
    } catch (error: any) {
      const msg =
        error.code === "auth/app-not-authorized"
          ? "SHA-1 Fingerprint missing in Firebase Console!"
          : error.message;
      Alert.alert("Failed to send OTP", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (forcedOtp?: string) => {
    const codeToVerify = forcedOtp || otpArray.join("");
    console.log("OTP", codeToVerify);
    if (!confirmation || codeToVerify.length < CODE_LENGTH) return;

    setIsLoading(true);
    try {
      await confirmation.confirm(codeToVerify);
    } catch (error: any) {
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
    } else {
      navigation.goBack();
    }
  };

  const isButtonDisabled =
    step === "PHONE_INPUT"
      ? phoneNumber.length < 10 || isLoading
      : otpArray.join("").length < CODE_LENGTH || isLoading;

  return {
    step,
    phoneNumber,
    setPhoneNumber,
    otpArray,
    timer,
    isLoading,
    inputRefs,
    handleSendOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyPress,
    handleBackPress,
    isButtonDisabled,
  };
}
