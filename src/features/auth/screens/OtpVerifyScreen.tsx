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
  View,
  KeyboardAvoidingView,
} from "react-native";
import {
  getAuth,
  signInWithPhoneNumber,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ArrowLeft } from "lucide-react-native";

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
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
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
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <ShieldCheck size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>{t("auth.verify")}</Text>
          <Text style={styles.subtitle}>{t("auth.enterOtp", { phone })}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.otpInput}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={CODE_LENGTH}
              placeholder="------"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {resendMessage ? (
            <Text style={styles.feedbackText}>{resendMessage}</Text>
          ) : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            ) : (
              <TouchableOpacity disabled={loading} onPress={handleResend}>
                <Text style={styles.resendText}>{t("auth.resendOtp")}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              code.length !== CODE_LENGTH && styles.disabledButton,
            ]}
            disabled={code.length !== CODE_LENGTH || loading}
            onPress={verifyCode}
          >
            {!loading ? (
              <Text style={styles.verifyText}>{t("auth.verify")}</Text>
            ) : (
              <ActivityIndicator size="small" color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OTPVerify;

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: theme.spacing.md,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.card,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    header: {
      alignItems: "center",
      marginTop: 100,
      marginBottom: theme.spacing.xl,
    },
    logoWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textLight,
      textAlign: "center",
      fontWeight: "500",
      lineHeight: 22,
      letterSpacing: 0.3,
      paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
      alignItems: "center",
      width: "100%",
    },
    inputContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: "100%",
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      marginBottom: theme.spacing.lg,
    },
    otpInput: {
      fontSize: 24,
      letterSpacing: 12,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      paddingVertical: 16,
    },
    errorText: {
      color: "red",
      textAlign: "center",
      marginBottom: theme.spacing.md,
      fontSize: 14,
      fontWeight: "500",
    },
    feedbackText: {
      textAlign: "center",
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
      fontSize: 14,
      fontWeight: "600",
    },
    resendContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.xl,
    },
    resendPrompt: {
      color: theme.colors.textLight,
      fontSize: 14,
    },
    timerText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    resendText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      width: "100%",
      paddingVertical: 18,
      borderRadius: theme.borderRadius.round,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    disabledButton: {
      backgroundColor: theme.colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    verifyText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
  });
