import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/types";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";

// Import your subcomponents
import { useSignUpFlow } from "../hooks/useSignUpFlow";
import { useAuthNavigation } from "../../../navigation/hooks";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { AuthFooterActions } from "../components/AuthFooterActions";
import { PhoneInputStep } from "../components/PhoneInputStep";
import { OtpVerifyStep } from "../components/OtpVerifyStep";
import { StepIndicatorBar } from "../components/StepIndicatorBar";

export default function EmailSignUpScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();

  const [agreeTerms, setAgreeTerms] = useState(false);

  const route =
    useRoute<RouteProp<RootStackParamList, "ForceOtpVerification">>();
  const initialPhone = route.params?.phoneNumber || "";

  // Destructuring updated 2-step flow properties cleanly
  const {
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
  } = useSignUpFlow(initialPhone);

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  const isBackActionLocked = step === "OTP_VERIFY" && timer > 0;

  // Handles hardware or swipe-back gestures locks during active OTP timers
  useEffect(() => {
    const unregisterBeforeRemoveListener = navigation.addListener(
      "beforeRemove",
      (e) => {
        if (!isBackActionLocked) return;

        e.preventDefault();

        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        const formattedTime = `${mins}:${secs < 10 ? "0" + secs : secs}`;

        Alert.alert(
          t("auth.backLockAlertTitle"),
          t("auth.backLockAlertMessage", { time: formattedTime }),
          [{ text: t("auth.backLockAlertBtn"), style: "default" }],
        );
      },
    );

    return unregisterBeforeRemoveListener;
  }, [navigation, isBackActionLocked, timer]);

  // Handles manual top-row arrow header navigation click checks
  const onArrowBackClick = () => {
    if (isBackActionLocked) {
      const mins = Math.floor(timer / 60);
      const secs = timer % 60;
      const formattedTime = `${mins}:${secs < 10 ? "0" + secs : secs}`;

      Alert.alert(
        t("auth.backLockAlertTitle"),
        t("auth.backLockAlertMessage", { time: formattedTime }),
        [{ text: t("auth.backLockAlertBtn"), style: "default" }],
      );
    } else {
      handleBackPress();
    }
  };

  // Central Router submission: Direct flow pipeline matching your two primary views
  const handleAuthSubmit = () => {
    if (step === "PHONE_INPUT") {
      handleInitialSignUp();
    } else if (step === "OTP_VERIFY") {
      handleVerifyAndLink();
    }
  };

  const finalButtonDisabled =
    step === "PHONE_INPUT" ? isButtonDisabled || !agreeTerms : isButtonDisabled;

  // Packed properties mapping profile parameters safely down into child components
  const phoneProps = {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
  };

  const otpProps = {
    phoneNumber,
    otpArray,
    inputRefs,
    handleOtpChange,
    handleOtpKeyPress,
    handleSendOtp,
    timer,
    isLoading,
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ================= SECTION 1: TOP IMAGE BANNER ================= */}
        <AuthHeaderBanner />

        {/* ================= SECTION 2: WHITE SHEET BLOCK ================= */}
        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetInnerContent}>
              <View style={styles.bodySection}>
                <View style={styles.formHeaderRow}>
                  <TouchableOpacity
                    onPress={onArrowBackClick}
                    style={styles.backTouchArea}
                  >
                    {step !== "PHONE_INPUT" && (
                      <ChevronLeft size={20} color="#111" />
                    )}
                    <Text style={styles.formHeadline}>
                      {step === "PHONE_INPUT" && t("auth.verifyTitleSignUp")}
                      {step === "OTP_VERIFY" && t("auth.verifyTitleOtp")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Progress bar tracking layout matches your active step context */}
                <StepIndicatorBar step={step} />

                {/* Render corresponding form components dynamically */}
                {step === "PHONE_INPUT" && <PhoneInputStep {...phoneProps} />}
                {step === "OTP_VERIFY" && <OtpVerifyStep {...otpProps} />}
              </View>

              {/* 🔹 Form Absolute Footer Control Area */}
              <AuthFooterActions
                step={step}
                isLoading={isLoading}
                finalButtonDisabled={finalButtonDisabled}
                handleAuthSubmit={handleAuthSubmit}
                openLink={openLink}
                insets={insets}
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F2F4F7",
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
      overflow: "hidden",
    },
    scrollContainer: {
      flexGrow: 1,
    },
    sheetInnerContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      justifyContent: "space-between",
    },
    bodySection: {
      width: "100%",
      justifyContent: "flex-start",
    },
    formHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backTouchArea: { flexDirection: "row", alignItems: "center", gap: 12 },
    formHeadline: { fontSize: 18, fontWeight: "700", color: "#111" },
  });
