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
import { useForm } from "react-hook-form";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
// import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

import { useSignUpFlow } from "../hooks/useSignUpFlow";
import { useAuthNavigation } from "../../../navigation/hooks";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { AuthFooterActions } from "../components/AuthFooterActions";
import {
  EmailInputField,
  PasswordInputField,
} from "../components/AuthInputFields";
import { AuthTermsDisclaimer } from "../components/AuthTermsDisclaimer";

export default function EmailSignUpScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();

  const {
    isLoading,
    executeRegistration,
    // executeGoogleSignUp,
    handleBackPress,
  } = useSignUpFlow();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const openLink = (url: string, title: string) => {
    navigation.navigate("WebView", { url, title });
  };

  const handleAuthSubmit = handleSubmit((data) => {
    executeRegistration(data);
  });

  const finalButtonDisabled = !isValid || isLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <AuthHeaderBanner />

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
                      {t("auth.signUpTitleEmail")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Google Sign-In Button (ACTIVE IMMEDIATELY) */}
                {/* <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={executeGoogleSignUp}
                  disabled={isLoading}
                  style={styles.googleButton}
                /> */}
                <View style={styles.googleButton}>
                  <Text>Continue with Google</Text>
                </View>

                {/* 3. "OR" Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("auth.or", "OR")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 1. Standard Email field */}
                <EmailInputField control={control} errors={errors} />

                {/* 2. Standard Password field */}
                <PasswordInputField
                  control={control}
                  errors={errors}
                  name="password"
                  labelKey="auth.fieldLabelPassword"
                  placeholderKey="auth.placeholderPassword"
                />

                {/* 3. Reused Confirm Password field with dynamic mismatch rule validation */}
                <PasswordInputField
                  control={control}
                  errors={errors}
                  name="confirmPassword"
                  labelKey="auth.fieldLabelConfirmPassword"
                  placeholderKey="auth.placeholderConfirmPassword"
                  validateRule={(val) =>
                    val === passwordValue ||
                    t("auth.passwordMismatch", "Passwords do not match")
                  }
                />
              </View>

              <AuthFooterActions
                isLoading={isLoading}
                finalButtonDisabled={finalButtonDisabled}
                handleAuthSubmit={handleAuthSubmit}
                insets={insets}
              >
                <View style={{ marginTop: 12 }}>
                  <AuthTermsDisclaimer openLink={openLink} />
                </View>
              </AuthFooterActions>
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
      backgroundColor: theme.colors.background, // Adaptive brand background token
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.card, // Adaptive dark/light card background
      borderTopLeftRadius: theme.borderRadius.lg, // 16px standard token
      borderTopRightRadius: theme.borderRadius.lg,
      marginTop: -20,
      overflow: "hidden",
    },
    scrollContainer: {
      flexGrow: 1,
    },
    sheetInnerContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg, // 24px core grid padding
      paddingTop: theme.spacing.md, // 16px vertical padding
      justifyContent: "space-between",
    },
    bodySection: {
      width: "100%",
      justifyContent: "flex-start",
    },
    formHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md, // 16px row space
    },
    backTouchArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm, // 8px horizontal layout spacing
    },
    formHeadline: {
      fontSize: theme.fontSize.lg, // 18px text standard
      fontWeight: "700",
      color: theme.colors.text, // Adaptive high-contrast brand text
      letterSpacing: 0.5,
    },
    // 🟢 Updated Divider and Google Button Styles
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.lg, // 24px vertical space for clean visual breathing room
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.textLight || theme.colors.text,
      fontSize: theme.fontSize.sm,
      fontWeight: "500",
    },
    googleButton: {
      width: "100%",
      height: 48,
      borderRadius: theme.borderRadius.md,
    },
  });
