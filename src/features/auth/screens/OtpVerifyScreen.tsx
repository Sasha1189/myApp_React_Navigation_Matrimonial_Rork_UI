import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
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
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../../../config/firebase";

// ---------------- Types ----------------
type OTPVerifyProps = {
  route: {
    params: {
      verificationId: string;
      phone: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
};

const CODE_LENGTH = 6;

const OTPVerify: React.FC<OTPVerifyProps> = ({ route, navigation }) => {
  const { verificationId: initialVerificationId, phone } = route.params;

  const [verificationId, setVerificationId] = useState<string>(
    initialVerificationId,
  );
  const [code, setCode] = useState<string>("");
  const [timer, setTimer] = useState<number>(60);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);

  const inputRef = useRef<TextInput>(null);
  const renderCount = useRef<number>(0);

  renderCount.current += 1;

  // Auto focus OTP input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (timer > 0) return true;
        return false;
      },
    );
    return () => backHandler.remove();
  }, [timer]);

  // Auto verify when full OTP entered
  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      Keyboard.dismiss();
      verifyCode();
    }
  }, [code]);

  // ---------------- Functions ----------------

  const verifyCode = async () => {
    try {
      setError("");
      setLoading(true);

      if (verifying) return;
      setVerifying(true);

      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
    } catch (err: any) {
      console.log("OTP verification error:", err.message);
      handleError(err);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setCode("");
      setTimer(60);
      setError("");
      setLoading(true);

      const confirmationResult = await signInWithPhoneNumber(auth, phone);

      if (confirmationResult.verificationId) {
        setVerificationId(confirmationResult.verificationId);
        setResendMessage("Code sent again!");
        setTimeout(() => setResendMessage(""), 5000);
      }
    } catch (err) {
      console.log("Resend OTP error:", err);
      Alert.alert("Error", "Failed to resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any) => {
    if (error.code === "auth/code-expired") {
      setError("OTP expired. Please resend the code.");
    } else if (error.code === "auth/invalid-verification-code") {
      setError("Invalid OTP. Please try again.");
    } else {
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);

      if (Platform.OS === "android") {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", errorMessage);
      }
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
    const numericText = text.replace(/[^0-9]/g, "");
    setCode(numericText);
  };

  // ---------------- JSX ----------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {timer === 0 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text>BackButton</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.timer}>{formatTime(timer)}</Text>
      <Text style={styles.desc}>Enter the 6-digit OTP we sent to {phone}</Text>

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
        autoFocus
        selectionColor="#ffa500"
        placeholder="------"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        disabled={timer > 0}
        onPress={handleResend}
        style={[styles.resendBtn, { opacity: timer > 0 ? 0.4 : 1 }]}
      >
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.doneBtn,
          { opacity: code.length === CODE_LENGTH && !error ? 1 : 0.5 },
        ]}
        disabled={code.length !== CODE_LENGTH || !!error}
        onPress={verifyCode}
      >
        {!loading ? (
          <Text style={styles.doneText}>Done</Text>
        ) : (
          <ActivityIndicator size="large" color="#fff" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OTPVerify;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
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
