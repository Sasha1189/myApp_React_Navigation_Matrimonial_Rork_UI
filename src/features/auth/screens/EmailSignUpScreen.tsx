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

import { useSignUpFlow } from "../hooks/useSignUpFlow";
import { useAuthNavigation } from "../../../navigation/hooks";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { AuthFooterActions } from "../components/AuthFooterActions";
import {
  EmailInputField,
  PasswordInputField,
} from "../components/AuthInputFields";

export default function EmailSignUpScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { isLoading, executeRegistration, handleBackPress } = useSignUpFlow();

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

  const finalButtonDisabled = !isValid || !agreeTerms || isLoading;

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
                openLink={openLink}
                insets={insets}
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
                showCheckbox={true}
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
  });
