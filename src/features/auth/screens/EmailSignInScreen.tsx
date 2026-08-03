import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm } from "react-hook-form";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useTranslation } from "react-i18next";
import { AuthHeaderBanner } from "../components/AuthHeaderBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoginEmail } from "../hooks/useLoginEmail";
import { useAuthNavigation } from "../../../navigation/hooks";
import {
  EmailInputField,
  PasswordInputField,
} from "../components/AuthInputFields";
import { AuthFooterActions } from "../components/AuthFooterActions";
import { NewAccountRedirectCard } from "../components/NewAccountRedirectCard";

export default function PhoneSignInScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useAuthNavigation();

  const { isLoading, executeLogin, handleForgotPassword } = useLoginEmail();

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
    },
  });

  const watchEmail = watch("email");

  const handleAuthSubmit = handleSubmit((data) => {
    executeLogin(data);
  });

  const finalButtonDisabled = !isValid || isLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <AuthHeaderBanner />

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
              <View style={styles.bodySection}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.formHeadline}>
                    {t("auth.verifyTitleLogin")}
                  </Text>
                </View>

                <EmailInputField control={control} errors={errors} />
                <PasswordInputField
                  control={control}
                  errors={errors}
                  name="password"
                  labelKey="auth.fieldLabelPassword"
                  placeholderKey="auth.placeholderPassword"
                />

                <TouchableOpacity
                  onPress={() => handleForgotPassword(watchEmail)}
                  activeOpacity={0.7}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t("auth.forgotPassword", "Forgot Password?")}
                  </Text>
                </TouchableOpacity>
              </View>

              <AuthFooterActions
                isLoading={isLoading}
                finalButtonDisabled={finalButtonDisabled}
                handleAuthSubmit={handleAuthSubmit}
                insets={insets}
                buttonText={t("auth.submitLogin", "Login")} // 🎯 Sets button copy to Login
                showCheckbox={false} // 🎯 Hides signup legal rules
              >
                <NewAccountRedirectCard
                  onPress={() => navigation.navigate("EmailSignUp")}
                />
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
      backgroundColor: theme.colors.background,
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
      flex: 1,
      paddingHorizontal: theme.spacing.lg, // 24px core layout columns spacing
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm, // 8px structural layout padding
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
    formHeadline: {
      fontSize: theme.fontSize.lg, // 18px text sizing tracking design layouts
      fontWeight: "700",
      color: theme.colors.text, // Nexa crisp text or high-contrast light text
      letterSpacing: 0.5,
    },
    forgotPasswordContainer: {
      alignSelf: "flex-end",
      marginTop: theme.spacing.sm, // 8px proximity text placement spacing
      paddingVertical: 4,
    },
    forgotPasswordText: {
      fontSize: theme.fontSize.xs, // 12px text links context
      fontWeight: "600",
      color: theme.colors.accent || "#1c7ed6", // Prefers your brand accent token
      letterSpacing: 0.5,
    },
    footerSection: {
      justifyContent: "flex-end",
      width: "100%",
      backgroundColor: theme.colors.card, // Adapts seamlessly to Dark Theme
      marginTop: theme.spacing.md, // 16px - 20px margin tracking consistency
    },
  });
