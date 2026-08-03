import React from "react";
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
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { GenericInputField } from "../components/AuthInputFields";
import { useUserInfoFlow } from "../hooks/useUserInfoFlow";

interface UserInfoFormData {
  fullName: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "";
}

export default function UserInfoScreen() {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { isLoading, executeProfileSetup } = useUserInfoFlow();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserInfoFormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      gender: "",
    },
  });

  const handleAuthSubmit = handleSubmit((data) => {
    executeProfileSetup(data);
  });

  const finalButtonDisabled = !isValid || isLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingTop: insets.top + 20 },
            ]}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Modal Card wrapper style container */}
            <View style={styles.modalCardWrapper}>
              <View style={styles.bodySection}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.formHeadline}>
                    {t("userInfo.screenTitle")}
                  </Text>
                </View>
                <Text style={styles.contextHelperText}>
                  {t("userInfo.helperText")}
                </Text>

                {/* Full Name Mandatory Field */}
                <GenericInputField
                  name="fullName"
                  labelKey="userInfo.labelFullName"
                  placeholderKey="userInfo.placeholderFullName"
                  control={control}
                  errors={errors}
                  rules={{
                    required: t(
                      "userInfo.errFullNameRequired",
                      "Full name is required",
                    ),
                  }}
                />

                {/* Mobile Contact Mandatory Field */}
                <GenericInputField
                  name="mobileNumber"
                  labelKey="userInfo.labelMobile"
                  placeholderKey="userInfo.placeholderMobile"
                  control={control}
                  errors={errors}
                  keyboardType="phone-pad"
                  rules={{
                    required: t(
                      "userInfo.errMobileRequired",
                      "Mobile number is required",
                    ),
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: t(
                        "userInfo.errMobileInvalid",
                        "Enter a valid phone number",
                      ),
                    },
                  }}
                />

                {/* Gender Segment Selection */}
                <View style={styles.genderWrapper}>
                  <Text style={styles.genderLabel}>
                    {t("userInfo.labelGender")}
                  </Text>
                  <Controller
                    control={control}
                    name="gender"
                    rules={{
                      required: t("userInfo.errGenderRequired"),
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.genderRowContainer}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[
                            styles.genderOptionButton,
                            value === "Male" && styles.genderMaleActive,
                          ]}
                          onPress={() => onChange("Male")}
                        >
                          <Text
                            style={[
                              styles.genderBtnText,
                              value === "Male" && styles.textActiveWhite,
                            ]}
                          >
                            {t("userInfo.male")}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[
                            styles.genderOptionButton,
                            value === "Female" && styles.genderFemaleActive,
                          ]}
                          onPress={() => onChange("Female")}
                        >
                          <Text
                            style={[
                              styles.genderBtnText,
                              value === "Female" && styles.textActiveWhite,
                            ]}
                          >
                            {t("userInfo.female")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.gender && (
                    <Text style={styles.errorLabelText}>
                      {errors.gender.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* 🌟 Direct profile actions footer replaces the old signup UI elements */}
              <View
                style={[
                  styles.footerBlock,
                  { paddingBottom: Math.max(insets.bottom, 20) },
                ]}
              >
                <TouchableOpacity
                  onPress={handleAuthSubmit}
                  disabled={finalButtonDisabled}
                  activeOpacity={0.8}
                  style={[
                    styles.submitButton,
                    finalButtonDisabled && styles.submitButtonDisabled,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {t("userInfo.submit")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (theme: AppTheme) => {
  const isDarkTheme = theme.colors.background === "#0A0A1F";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkTheme ? "rgba(10,10,31,0.95)" : "rgba(0,0,0,0.05)",
    },
    sheetContainer: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    modalCardWrapper: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkTheme ? 0.4 : 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    bodySection: {
      width: "100%",
      justifyContent: "flex-start",
    },
    formHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    formHeadline: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    contextHelperText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.md,
      lineHeight: 18,
    },
    genderWrapper: {
      marginTop: theme.spacing.md,
    },
    genderLabel: {
      fontSize: theme.fontSize.xs,
      fontWeight: "600",
      color: theme.colors.textLight,
      marginBottom: theme.spacing.xs,
    },
    genderRowContainer: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    genderOptionButton: {
      flex: 1,
      height: 52,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    genderMaleActive: {
      backgroundColor: "#007AFF",
      borderColor: "#007AFF",
    },
    genderFemaleActive: {
      backgroundColor: "#FF1493",
      borderColor: "#FF1493",
    },
    genderBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textLight,
    },
    textActiveWhite: {
      color: "#FFFFFF",
    },
    errorLabelText: {
      color: theme.colors.danger,
      fontSize: theme.fontSize.xs,
      marginTop: theme.spacing.xs,
      fontWeight: "500",
    },
    footerBlock: {
      marginTop: theme.spacing.xl,
    },
    submitButton: {
      height: 52,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkTheme ? 0.5 : 0.2,
      shadowRadius: 6,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    submitBtnText: {
      color: "#FFFFFF",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
  });
};
