import React, { useState } from "react";
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
import { HelpCircle, Check } from "lucide-react-native";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLoginEmail } from "../hooks/useLoginEmail";
import { useAuthNavigation } from "../../../navigation/hooks";

const { width, height } = Dimensions.get("window");

export default function PhoneSignInScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigation = useAuthNavigation();

  // Destructure parameters directly from your simplified useLoginFlow hook
  const {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    isLoading,
    handleAuthSubmit,
    isButtonDisabled,
  } = useLoginEmail();

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  if (!theme) return null;

  // Enforce both form completeness and terms agreement before enabling the submit button
  const finalButtonDisabled = isButtonDisabled || !agreeTerms || isLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ================= SECTION 1: TOP IMAGE ================= */}
        <View style={styles.carouselWrapper}>
          <Image
            source={require("../../../../assets/images/m1.webp")}
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
                  Alert.alert(
                    t("auth.helpAlertTitle"),
                    t("auth.helpAlertMessage"),
                    [
                      {
                        text: t("auth.helpAlertCancel"),
                        style: "cancel",
                      },
                      {
                        text: t("auth.helpAlertCall"),
                        style: "default",
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
        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheetInnerContent}>
            {/* Unified Form Body Content */}
            <View style={styles.bodySection}>
              <View style={styles.formHeaderRow}>
                <Text style={styles.formHeadline}>
                  {t("auth.verifyTitlePhone")}
                </Text>
              </View>

              <Text style={styles.formSubhead}>{t("auth.phoneSubhead")}</Text>

              {/* 🎯 FIELD 1: MOBILE NUMBER INPUT */}
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

              {/* 🎯 FIELD 2: PASSWORD INPUT (Placed directly below phone number) */}
              <View style={[styles.inputFlexContainer, { marginTop: 16 }]}>
                <Text style={styles.fieldLabel}>
                  {t("auth.fieldLabelPassword", "Password")}
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Password (Min 6 characters)"
                    placeholderTextColor="#A8A8A8"
                    secureTextEntry={true} // Obfuscates typing for data security privacy standards
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
            </View>

            {/* 🔹 Form Absolute Footer Area */}
            <View
              style={[
                styles.footerSection,
                {
                  paddingBottom:
                    Platform.OS === "android" ? Math.max(insets.bottom, 16) : 0,
                },
              ]}
            >
              <View style={styles.checkboxContainer}>
                {/* Clickable Checkbox Box */}
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

                {/* Direct Clickable Legal Link Text */}
                <Text
                  style={styles.checkboxLabel}
                  onPress={() =>
                    openLink("https://github.io", "Terms & Privacy")
                  }
                >
                  {t("auth.checkboxTerms")}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionSubmitBtn,
                  finalButtonDisabled && styles.actionDisabledBtn,
                ]}
                disabled={finalButtonDisabled}
                onPress={handleAuthSubmit}
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
                    {t("auth.submitLogin", "Login / Sign Up")}
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
      paddingTop: 24,
      justifyContent: "space-between",
      minHeight: height * 0.72,
    },
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
      alignItems: "center",
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
    },
    checkboxActive: { backgroundColor: "#1A1A4B", borderColor: "#1A1A4B" },
    checkboxLabel: {
      fontSize: 12,
      color: "#555",
      lineHeight: 18,
      fontWeight: "500",
      textDecorationLine: "underline",
      includeFontPadding: false,
      textAlignVertical: "center",
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
  });
