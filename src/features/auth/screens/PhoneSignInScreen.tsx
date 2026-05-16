import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, HelpCircle, Check } from "lucide-react-native";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLoginFlow } from "../hooks/useLoginFlow";
import { useAuthNavigation } from "../../../navigation/hooks";

const { width, height } = Dimensions.get("window");

export default function PhoneSignInScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigation = useAuthNavigation();

  const {
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
  } = useLoginFlow();

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  const isBackActionLocked = step === "OTP_VERIFY" && timer > 0;

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
          "सुरक्षितता चेतावणी",
          `कृपया रीसेंड पर्याय मिळेपर्यंत थांबा. सुरक्षेसाठी तुम्ही पुढील ${formattedTime} मिनिटे मागे जाऊ शकत नाही.`,
          [{ text: "ठीक आहे", style: "default" }],
        );
      },
    );

    return unregisterBeforeRemoveListener;
  }, [navigation, isBackActionLocked, timer]);

  const onArrowBackClick = () => {
    if (isBackActionLocked) {
      const mins = Math.floor(timer / 60);
      const secs = timer % 60;
      const formattedTime = `${mins}:${secs < 10 ? "0" + secs : secs}`;

      Alert.alert(
        "कृपया प्रतीक्षा करा",
        `कृपया रीसेंड पर्याय मिळेपर्यंत थांबा. सुरक्षेसाठी तुम्ही पुढील ${formattedTime} मिनिटे मागे जाऊ शकत नाही.`,
        [{ text: "ठीक आहे", style: "default" }],
      );
    } else {
      handleBackPress();
    }
  };

  if (!theme) return null;

  const finalButtonDisabled =
    step === "PHONE_INPUT" ? isButtonDisabled || !agreeTerms : isButtonDisabled;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ================= SECTION 1: TOP IMAGE ================= */}
        <View style={styles.carouselWrapper}>
          <Image
            source={require("../../../../assets/images/m1.png")}
            style={styles.heroImage}
            contentFit="scale-down"
          />
          <SafeAreaView style={styles.floatingHeaderContainer}>
            <View style={styles.headerTopRow}>
              <View style={{ width: 40 }} />
              <TouchableOpacity
                style={styles.helpButton}
                activeOpacity={0.8}
                onPress={() => {
                  console.log("Help button clicked!");
                  Alert.alert(
                    t("auth.helpAlertTitle") || "Help & Support", // 📌 Popup Title
                    t("auth.helpAlertMessage") ||
                      "Please call admin mobile number. 8554840100", // 💬 Message Text
                    [
                      {
                        text: t("auth.helpAlertCancel") || "Cancel",
                        style: "cancel",
                      },
                      {
                        text: t("auth.helpAlertCall") || "Call Now",
                        style: "default",
                        // 📞 Automatically opens the phone dialer with the number filled in
                        onPress: () => Linking.openURL("tel:8554840100"),
                      },
                    ],
                  );
                }}
              >
                <HelpCircle size={16} color="white" />
                <Text style={styles.helpText}>{t("auth.help")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.brandTitleBlock}>
              <Text style={styles.welcomeText}>{t("auth.welcome")}</Text>
              <Text style={styles.brandText}>{t("auth.brandName")}</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* ================= SECTION 2: WHITE SHEET BLOCK ================= */}
        {/* 🔹 Fixed Keyboard avoiding layout configuration wrapper */}
        <KeyboardAvoidingView style={styles.sheetContainer}>
          <View style={styles.sheetInnerContent}>
            <View style={styles.indicatorBarContainer}>
              <View
                style={[
                  styles.indicatorSegment,
                  step === "PHONE_INPUT"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
              <View
                style={[
                  styles.indicatorSegment,
                  step === "OTP_VERIFY"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
            </View>

            {/* Form Upper Content Area (Body) */}
            <View style={styles.bodySection}>
              <View style={styles.formHeaderRow}>
                <TouchableOpacity
                  onPress={onArrowBackClick}
                  style={styles.backTouchArea}
                >
                  <ArrowLeft size={22} color="#111" />
                  <Text style={styles.formHeadline}>
                    {step === "PHONE_INPUT"
                      ? t("auth.verifyTitlePhone")
                      : t("auth.verifyTitleOtp")}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formSubhead}>
                {step === "PHONE_INPUT"
                  ? t("auth.phoneSubhead")
                  : t("auth.otpSubhead", { lastFour: phoneNumber.slice(-4) })}
              </Text>

              {step === "PHONE_INPUT" ? (
                <View style={styles.inputFlexContainer}>
                  <Text style={styles.fieldLabel}>
                    {t("auth.fieldLabelPhone")}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter Mobile Number"
                      placeholderTextColor="#A8A8A8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phoneNumber}
                      onChangeText={(val) =>
                        setPhoneNumber(val.replace(/[^0-9]/g, ""))
                      }
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputFlexContainer}>
                  <Text style={styles.fieldLabel}>
                    {t("auth.fieldLabelOtp")}
                  </Text>
                  <View style={styles.otpBoxesRow}>
                    {otpArray.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputRefs.current[index] = ref as TextInput;
                        }}
                        style={[
                          styles.otpBox,
                          digit !== "" && styles.otpBoxFilled,
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>
                  <View style={styles.resendActionRow}>
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      disabled={timer > 0 || isLoading}
                    >
                      <Text
                        style={[
                          styles.subActionText,
                          timer > 0 && styles.disabledSubAction,
                        ]}
                      >
                        {t("auth.didNotReceive")}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.timerText}>
                      {timer > 0
                        ? t("auth.resendIn", {
                            seconds: timer < 10 ? "0" + timer : timer,
                          })
                        : t("auth.resendAvailable")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 🔹 Form Absolute Footer Area (Anchored to base layout) */}
            <View
              style={[
                styles.footerSection,
                {
                  paddingBottom:
                    Platform.OS === "android" ? Math.max(insets.bottom, 16) : 0,
                },
              ]}
            >
              {step === "PHONE_INPUT" && (
                <View
                  style={[
                    styles.checkboxContainer,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  {/* 1. Clickable Checkbox Box */}
                  <TouchableOpacity
                    onPress={() => setAgreeTerms(!agreeTerms)}
                    activeOpacity={0.8}
                    style={[
                      styles.checkboxBox,
                      agreeTerms && styles.checkboxActive,
                    ]}
                  >
                    {agreeTerms && (
                      <Check size={12} color="white" strokeWidth={3} />
                    )}
                  </TouchableOpacity>

                  {/* 2. Direct Clickable Text Target (No Wrapper Conflict!) */}
                  <Text
                    style={[
                      styles.checkboxLabel,
                      {
                        textDecorationLine: "underline",
                        marginLeft: 12, // ↔️ Pushes label away from checkbox box
                        includeFontPadding: false, // 🛠️ Prevents hidden font padding issues on Android
                        textAlignVertical: "center", // 🎯 Aligns text baseline uniformly on Android
                      },
                    ]}
                    onPress={() =>
                      openLink(
                        "https://sasha1189.github.io/youva-Lonari/",
                        "Terms",
                      )
                    }
                  >
                    {t("auth.checkboxTerms")}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.actionSubmitBtn,
                  finalButtonDisabled && styles.actionDisabledBtn,
                ]}
                disabled={finalButtonDisabled}
                onPress={
                  step === "PHONE_INPUT"
                    ? handleSendOtp
                    : () => handleVerifyOtp()
                }
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={[
                      styles.actionSubmitText,
                      finalButtonDisabled && styles.actionDisabledText,
                    ]}
                  >
                    {step === "PHONE_INPUT"
                      ? t("auth.btnSendOtp")
                      : t("auth.btnVerify")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
    carouselWrapper: {
      width: width,
      height: height * 0.3,
      position: "relative",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    floatingHeaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 24,
      justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.15)",
    },
    headerTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      gap: 4,
      zIndex: 999,
    },
    helpText: { color: "white", fontSize: 12, fontWeight: "600" },
    brandTitleBlock: { marginBottom: 5 },
    welcomeText: {
      fontSize: 13,
      color: "rgba(255,255,255,0.85)",
      fontWeight: "500",
    },
    brandText: {
      fontSize: 26,
      fontWeight: "800",
      color: "white",
      marginTop: 2,
    },

    // Outer Sheet Container Framer
    sheetContainer: {
      flex: 1,
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
    },
    sheetInnerContent: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      justifyContent: "space-between",
      minHeight: height * 0.72,
    },
    indicatorBarContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      alignSelf: "center",
      marginBottom: 20,
    },
    indicatorSegment: {
      width: 125,
      height: 5,
      borderRadius: 3,
    },
    segmentActive: { backgroundColor: "#2F6BFF" },
    segmentInactive: { backgroundColor: "#E4E7ED" },
    bodySection: {
      width: "100%",
      flex: 1,
      justifyContent: "flex-start",
    },
    formHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backTouchArea: { flexDirection: "row", alignItems: "center", gap: 12 },
    formHeadline: { fontSize: 18, fontWeight: "700", color: "#111" },
    formSubhead: {
      fontSize: 13,
      color: "#666",
      lineHeight: 18,
      marginBottom: 24,
    },
    inputFlexContainer: { width: "100%", marginTop: 4 },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#666",
      marginBottom: 10,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#DCDFE6",
      borderRadius: 4,
      paddingHorizontal: 16,
      height: 52,
      backgroundColor: "white",
    },
    countryCode: {
      fontSize: 16,
      fontWeight: "600",
      color: "#111",
      marginRight: 12,
    },
    textInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111" },
    footerSection: {
      justifyContent: "flex-end",
      width: "100%",
      backgroundColor: "white",
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 20,
      paddingRight: 16,
    },
    checkboxBox: {
      width: 18,
      height: 18,
      borderWidth: 1.5,
      borderColor: "#A3A3A3",
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkboxActive: { backgroundColor: "#1A1A4B", borderColor: "#1A1A4B" },
    checkboxLabel: {
      fontSize: 12,
      color: "#555",
      lineHeight: 18,
      fontWeight: "500",
    },
    actionSubmitBtn: {
      backgroundColor: "#1A1A4B",
      paddingVertical: 15,
      borderRadius: 4,
      alignItems: "center",
      width: "100%",
    },
    actionSubmitText: { color: "white", fontSize: 15, fontWeight: "700" },
    actionDisabledBtn: { backgroundColor: "#E4E7ED" },
    actionDisabledText: { color: "#A8ABB2" },
    otpBoxesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: 6,
    },
    otpBox: {
      flex: 1,
      height: 52,
      backgroundColor: "#F2F4F7",
      borderRadius: 6,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      color: "#111",
      borderWidth: 1,
      borderColor: "#DCDFE6",
    },
    otpBoxFilled: { backgroundColor: "white", borderColor: "#1A1A4B" },
    resendActionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
    },
    subActionText: { color: "#1A1A4B", fontSize: 13, fontWeight: "600" },
    disabledSubAction: { color: "#A3A3A3" },
    timerText: { color: "#666", fontSize: 13 },
  });
