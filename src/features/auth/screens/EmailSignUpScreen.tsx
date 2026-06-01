import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// Import your subcomponents
import { useSignUpFlow } from "../hooks/useSignUpFlow";
import { useAuthNavigation } from "../../../navigation/hooks";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { AuthFooterActions } from "../components/AuthFooterActions";
import { PhoneInputStep } from "../components/PhoneInputStep";

export default function EmailSignUpScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();

  const [agreeTerms, setAgreeTerms] = useState(false);

  // 👑 UPDATE 1: Destructured the streamlined single-step signature hooks parameters cleanly
  const {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleSignUpSubmit,
    handleBackPress,
    isButtonDisabled,
  } = useSignUpFlow();

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  // 👑 UPDATE 2: Submission button state triggers your direct registration thread execution loop
  const handleAuthSubmit = () => {
    handleSignUpSubmit();
  };

  const finalButtonDisabled = isButtonDisabled || !agreeTerms || isLoading;

  // Unified prop payload payload mapping cleanly down to your input layouts component
  const phoneProps = {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
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
                    onPress={handleBackPress}
                    style={styles.backTouchArea}
                  >
                    <Text style={styles.formHeadline}>
                      {t("auth.signUpTitlePhone")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 👑 UPDATE 3: Displays input wrappers directly as a cohesive single screen step */}
                <PhoneInputStep {...phoneProps} />
              </View>

              {/* 🔹 Form Absolute Footer Control Area */}
              <AuthFooterActions
                step="PHONE_INPUT" // Static identifier fallback mapping for structural compatibility
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
