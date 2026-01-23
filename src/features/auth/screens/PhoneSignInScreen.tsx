import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthNavigation } from "../../../navigation/hooks";
import { Phone, ArrowRight, Heart } from "lucide-react-native";
import { theme } from "../../../constants/theme";
import { PhoneAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../../config/firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
// import * as PhoneNumber from "expo-sms-retriever";

const { width, height } = Dimensions.get("window");

export default function PhoneSignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const navigation = useAuthNavigation();

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    // if (phoneNumber.length < 10) {
    //   Alert.alert("Error", "Please enter a valid phone number");
    //   return;
    // }
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);

    const fullPhone = `+91${phoneNumber}`; // 🔥 CHANGED: Ensure proper format
    try {
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        fullPhone,
        recaptchaVerifier.current as any, // expo types mismatch sometimes
      );

      navigation.navigate("OTPVerify", { phone: fullPhone, verificationId });
    } catch (err: unknown) {
      const error = err as FirebaseError;
      Alert.alert(
        "Failed to send OTP",
        error?.message || "Something went wrong, please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
    // const cleaned = text.replace(/\D/g, "");
    // const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    // if (match) {
    //   return [match[1], match[2], match[3]].filter(Boolean).join("-");
    // }
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Heart
                size={32}
                color={theme.colors.accent}
                fill={theme.colors.accent}
              />
              <Text style={styles.appName}>LoveConnect</Text>
            </View>
            <Text style={styles.title}>Enter your phone number</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code to confirm your number
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Phone
                size={20}
                color={theme.colors.textLight}
                style={styles.phoneIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="123-456-7890"
                placeholderTextColor={theme.colors.textLight}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={12}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                !phoneNumber.trim() && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!phoneNumber.trim() || isLoading}
            >
              {isLoading ? (
                <Text style={styles.continueText}>Sending...</Text>
              ) : (
                <>
                  <Text style={styles.continueText}>Continue</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.termsText}>
              By continuing, you agree to receive SMS messages from LoveConnect.
              Message and data rates may apply.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  appName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  formContainer: {
    alignItems: "center",
    gap: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: "100%",
    maxWidth: 300,
  },
  phoneIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md + 4,
    borderRadius: theme.borderRadius.round,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    minWidth: width * 0.6,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.textLight,
    opacity: 0.6,
  },
  continueText: {
    color: "white",
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
  termsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: theme.spacing.md,
  },
});
