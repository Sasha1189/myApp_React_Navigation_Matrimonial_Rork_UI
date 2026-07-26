import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoginEmail } from "../hooks/useLoginEmail";
import { useAuthNavigation } from "../../../navigation/hooks";

export default function PhoneSignInScreen() {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();
  const [securePassword, setSecurePassword] = useState(true);

  const {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    isLoading,
    handleAuthSubmit,
    isButtonDisabled,
    handleForgotPassword,
  } = useLoginEmail();

  const finalButtonDisabled = isButtonDisabled || isLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ================= SECTION 1: TOP IMAGE (Stays static at top) ================= */}
        <AuthHeaderBanner />

        {/* ================= SECTION 2: KEYBOARD AVOIDING WHITE SHEET BLOCK ================= */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.sheetContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetInnerContent}>
              {/* Upper Content Shell */}
              <View style={styles.bodySection}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.formHeadline}>
                    {t("auth.verifyTitleLogin")}
                  </Text>
                </View>

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

                {/* 🎯 FIELD 2: PASSWORD INPUT */}
                <View style={[styles.inputFlexContainer, { marginTop: 16 }]}>
                  <Text style={styles.fieldLabel}>
                    {t("auth.fieldLabelPassword", "Password")}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[
                        styles.textInput,
                        { letterSpacing: securePassword ? 2 : 0.5 },
                      ]}
                      placeholder="Enter Password (Min 6 Char)"
                      placeholderTextColor="#A8A8A8"
                      secureTextEntry={securePassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    {/* Eye Toggle Trigger Box */}
                    <TouchableOpacity
                      onPress={() => setSecurePassword(!securePassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.eyeIconButton}
                      activeOpacity={0.7}
                    >
                      {securePassword ? (
                        <EyeOff size={20} color="#8A8A8A" />
                      ) : (
                        <Eye size={20} color="#1c7ed6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {/* 🎯 LINK 3: FORGOT PASSWORD */}
                <TouchableOpacity
                  onPress={() => handleForgotPassword()} // Define this function to handle recoveries
                  activeOpacity={0.7}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t("auth.forgotPassword", "Forgot Password?")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 🔹 Lower Content Shell (Footer Button & Legal) */}
              <View
                style={[
                  styles.footerSection,
                  {
                    paddingBottom:
                      Platform.OS === "android"
                        ? Math.max(insets.bottom, 16)
                        : 16,
                  },
                ]}
              >
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
                      {t("auth.submitLogin", "Login")}
                    </Text>
                  )}
                </TouchableOpacity>
                {/* 🎯 LINK 4: NEW HERE? CREATE ACCOUNT REDIRECTION */}
                <TouchableOpacity
                  onPress={() => navigation.navigate("EmailSignUp")} // Swap with your active routing navigator
                  activeOpacity={0.7}
                  style={styles.switchAuthModeContainer}
                >
                  <Text style={styles.switchAuthModeText}>
                    {t("auth.newHerePrefix")}
                    <Text style={styles.switchAuthModeLink}>
                      {t("auth.createAccountLink")}
                    </Text>
                  </Text>
                  <View
                    style={[
                      styles.inlineBackButton,
                      { backgroundColor: theme.colors.primary || "#1A1A4B" },
                    ]}
                  >
                    <ArrowRight size={22} color="#F8F8F8" />
                  </View>
                </TouchableOpacity>
              </View>
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
    // 👑 FIX 1: Sheet now occupies the remaining flex space beneath the carousel safely
    sheetContainer: {
      flex: 1,
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
      overflow: "hidden",
    },

    // 👑 FIX 2: Explicit scroll configuration to ensure proper scaling properties
    scrollContainer: {
      flexGrow: 1,
    },

    // 👑 FIX 3: Replaced hardcoded height restrictions with layout self-justification
    sheetInnerContent: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 8,
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
    formHeadline: {
      fontSize: 18,
      fontWeight: "700",
      color: "#111",
      letterSpacing: 0.5,
    },
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
      letterSpacing: 0.5,
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
      letterSpacing: 0.5,
    },
    textInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
      color: "#111",
      letterSpacing: 2,
    },
    eyeIconButton: {
      paddingLeft: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    footerSection: {
      justifyContent: "flex-end",
      width: "100%",
      backgroundColor: "white",
      marginTop: 20,
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
      includeFontPadding: false,
      textAlignVertical: "center",
      letterSpacing: 1.2,
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
    forgotPasswordContainer: {
      alignSelf: "flex-end",
      marginTop: 12,
      paddingVertical: 4,
    },
    forgotPasswordText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#1c7ed6", // Highlights option text cleanly
      letterSpacing: 0.5,
    },
    switchAuthModeContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
      marginTop: 20,
      marginBottom: 10,
      paddingVertical: 8,
    },
    switchAuthModeText: {
      fontSize: 14,
      color: "#555",
      fontWeight: "500",
      letterSpacing: 0.5,
    },
    switchAuthModeLink: {
      color: "#1c7ed6",
      fontWeight: "700",
      letterSpacing: 0.5,
      textDecorationLine: "underline",
    },
    inlineBackButton: {
      left: 24,
      width: 40,
      height: 40,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      zIndex: 10,
    },
  });
