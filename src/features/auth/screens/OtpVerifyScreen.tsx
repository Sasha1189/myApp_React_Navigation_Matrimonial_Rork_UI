import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  ToastAndroid,
  BackHandler,
} from "react-native";
import {
  getAuth,
  signInWithPhoneNumber,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
type OTPVerifyProps = {
  route: {
    params: {
      // 2. CHANGE: Expect the confirmation object instead of verificationId string
      confirmation: FirebaseAuthTypes.ConfirmationResult;
      phone: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
};

const CODE_LENGTH = 6;
const RESEND_TIME = 60;

const OTPVerify: React.FC<OTPVerifyProps> = ({ route, navigation }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  if (!theme) return null;

  const { confirmation: initialConfirmation, phone } = route.params;

  const [confirmation, setConfirmation] = useState(initialConfirmation);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(RESEND_TIME);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Auto focus OTP input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer (FIXED)
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => timer > 0,
    );
    return () => backHandler.remove();
  }, [timer]);

  useEffect(() => {
    if (code.length === CODE_LENGTH && !verifying) {
      Keyboard.dismiss();
      verifyCode();
    }
  }, [code]);

  const verifyCode = async () => {
    if (verifying) return;

    try {
      setVerifying(true);
      setLoading(true);
      setError("");

      await confirmation.confirm(code);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setCode("");
      setTimer(RESEND_TIME);
      setError("");
      setLoading(true);

      // 5. CHANGE: Use native signInWithPhoneNumber
      const auth = getAuth();
      const newConfirmation = await signInWithPhoneNumber(auth, phone);

      setConfirmation(newConfirmation);
      setResendMessage(t("auth.otpSent"));
      setTimeout(() => setResendMessage(""), 4000);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any) => {
    // setError(message);
    let message = t("auth.genericError");

    // Native SDK error codes are slightly different but similar
    if (error?.code === "auth/invalid-verification-code") {
      message = t("auth.invalidOtp");
    } else if (error?.code === "auth/session-expired") {
      message = t("auth.otpExpired");
    } else {
      message = error.message;
    }

    setError(message);

    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(t("common.error"), message);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      secs < 10 ? "0" + secs : secs
    }`;
  };

  const handleCodeChange = (text: string) => {
    setCode(text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {timer === 0 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text>{t("common.back")}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.timer}>{formatTime(timer)}</Text>
      <Text style={styles.desc}>{t("auth.enterOtp", { phone })}</Text>

      {resendMessage ? (
        <Text style={styles.feedbackText}>{resendMessage}</Text>
      ) : null}

      <TextInput
        ref={inputRef}
        style={styles.otpInput}
        value={code}
        onChangeText={handleCodeChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        placeholder="------"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        disabled={timer > 0 || loading}
        onPress={handleResend}
        style={[styles.resendBtn, { opacity: timer > 0 ? 0.4 : 1 }]}
      >
        <Text style={styles.resendText}>{t("auth.resendOtp")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.doneBtn,
          { opacity: code.length === CODE_LENGTH && !loading ? 1 : 0.5 },
        ]}
        disabled={code.length !== CODE_LENGTH || loading}
      >
        {!loading ? (
          <Text style={styles.doneText}>{t("auth.verifying")}</Text>
        ) : (
          <ActivityIndicator size="large" color="#fff" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OTPVerify;

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      justifyContent: "center",
      padding: 24,
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 10,
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 8,
      elevation: 3,
    },
    timer: {
      textAlign: "center",
      fontSize: 16,
      color: "#888",
      marginBottom: 12,
    },
    desc: {
      textAlign: "center",
      fontSize: 18,
      marginBottom: 24,
      fontWeight: "500",
    },
    otpInput: {
      fontSize: 24,
      letterSpacing: 16,
      color: "#000",
      textAlign: "center",
      borderWidth: 1,
      borderColor: "#ffa500",
      paddingVertical: 12,
      marginBottom: 24,
    },
    errorText: {
      color: "red",
      textAlign: "center",
      marginBottom: 20,
      fontSize: 14,
    },
    feedbackText: {
      textAlign: "center",
      color: "green",
      fontSize: 16,
      marginBottom: 10,
    },
    resendBtn: {
      marginTop: 20,
      marginBottom: 50,
    },
    resendText: {
      textAlign: "right",
      color: "#ff9800",
      fontSize: 16,
    },
    doneBtn: {
      height: 50,
      backgroundColor: "#ffa500",
      borderRadius: 10,
      justifyContent: "center",
    },
    doneText: {
      textAlign: "center",
      fontSize: 20,
      color: "#fff",
      fontWeight: "bold",
    },
  });
