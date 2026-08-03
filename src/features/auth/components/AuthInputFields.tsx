import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface FieldProps {
  control: any;
  errors: any;
  name?: "password" | "confirmPassword"; // Enforce type-safety for password variations
  labelKey?: string; // 🎯 Reusable translation key reference
  placeholderKey?: string; // 🎯 Reusable translation placeholder key reference
  validateRule?: (value: string) => boolean | string;
}

export const EmailInputField: React.FC<
  Pick<FieldProps, "control" | "errors">
> = ({ control, errors }) => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.inputFlexContainer}>
      {/* 🎯 i18n Translation Hookups applied dynamically */}
      <Text style={styles.fieldLabel}>
        {t("auth.fieldLabelEmail", "Email Address")}
      </Text>
      <View
        style={[styles.inputWrapper, errors.email && styles.errorInputWrapper]}
      >
        <Controller
          control={control}
          name="email"
          rules={{
            required: t("auth.emailRequired", "Email is required"),
            pattern: {
              value: /^\S+@\S+$/i,
              message: t(
                "auth.emailInvalid",
                "Please enter a valid email address",
              ),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              placeholder={t("auth.placeholderEmail", "name@example.com")}
              placeholderTextColor="#A8A8A8"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}
    </View>
  );
};

export const PasswordInputField: React.FC<FieldProps> = ({
  control,
  errors,
  name = "password",
  labelKey = "auth.fieldLabelPassword", // Defaults to standard password labels
  placeholderKey = "auth.placeholderPassword", // Defaults to standard password placeholder
  validateRule,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [securePassword, setSecurePassword] = useState(true);

  // Translate properties locally based on requested key contexts
  const currentLabelText = t(labelKey);

  return (
    <View style={styles.inputFlexContainer}>
      <Text style={styles.fieldLabel}>{currentLabelText}</Text>
      <View
        style={[styles.inputWrapper, errors[name] && styles.errorInputWrapper]}
      >
        <Controller
          control={control}
          name={name}
          rules={{
            required: `${currentLabelText} ${t("auth.isRequiredSuffix", "is required")}`,
            minLength: {
              value: 6,
              message: t(
                "auth.passwordTooShort",
                "Minimum 6 characters required",
              ),
            },
            validate: validateRule,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.textInput,
                { letterSpacing: securePassword ? 2 : 0.5 },
              ]}
              placeholder={t(placeholderKey)}
              placeholderTextColor="#A8A8A8"
              secureTextEntry={securePassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <TouchableOpacity
          onPress={() => setSecurePassword(!securePassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeIconButton}
          activeOpacity={0.7}
        >
          {securePassword ? (
            <EyeOff size={20} color={theme?.colors?.textLight || "#8A8A8A"} />
          ) : (
            <Eye size={20} color={theme?.colors?.accent || "#1c7ed6"} />
          )}
        </TouchableOpacity>
      </View>
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name].message}</Text>
      )}
    </View>
  );
};

// Append this inside your existing components file alongside EmailInputField and PasswordInputField

interface GenericFieldProps {
  control: any;
  errors: any;
  name: string;
  labelKey: string;
  placeholderKey: string;
  rules?: object;
  keyboardType?: "default" | "phone-pad";
}

export const GenericInputField: React.FC<GenericFieldProps> = ({
  control,
  errors,
  name,
  labelKey,
  placeholderKey,
  rules,
  keyboardType = "default",
}) => {
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.inputFlexContainer}>
      <Text style={styles.fieldLabel}>{t(labelKey)}</Text>
      <View
        style={[styles.inputWrapper, errors[name] && styles.errorInputWrapper]}
      >
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              placeholder={t(placeholderKey)}
              placeholderTextColor="#A8A8A8"
              keyboardType={keyboardType}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name].message}</Text>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    inputFlexContainer: { width: "100%", marginTop: theme.spacing.md },
    fieldLabel: {
      fontSize: theme.fontSize.xs,
      fontWeight: "600",
      color: theme.colors.textLight,
      marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      height: 52,
    },
    errorInputWrapper: { borderColor: theme.colors.danger },
    textInput: {
      flex: 1,
      paddingVertical: Platform.OS === "ios" ? theme.spacing.md : 10,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    eyeIconButton: {
      paddingLeft: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.fontSize.xs,
      marginTop: theme.spacing.xs,
      fontWeight: "500",
    },
  });
