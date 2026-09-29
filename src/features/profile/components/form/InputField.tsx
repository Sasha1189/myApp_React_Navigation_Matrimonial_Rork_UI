import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  icon?: React.ComponentType<any>;
  editable?: boolean;
  required?: boolean;
  locked?: boolean;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  icon: Icon,
  editable = true,
  required,
  locked,
  maxLength,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      {/* 1. Header Label with Tinted Icon */}
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          {Icon && (
            <View style={styles.iconWrapper}>
              <Icon size={14} color={theme.colors.primary} />
            </View>
          )}
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </View>
      </View>

      {/* 2. Input Box matching PickerField */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            !editable && styles.disabledInput,
            locked && styles.lockedInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          multiline={multiline}
          keyboardType={keyboardType}
          editable={editable && !locked}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
      paddingHorizontal: 2,
    },
    labelLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconWrapper: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.xs,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.4,
    },
    requiredStar: {
      color: theme.colors.danger,
    },
    inputWrapper: {
      marginTop: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
      minHeight: 40,
      justifyContent: "center",
      textAlign: "center",
      paddingVertical: 0,
    },
    multiline: {
      minHeight: 60,
      textAlignVertical: "top",
      paddingTop: theme.spacing.sm,
    },
    disabledInput: {
      backgroundColor: theme.colors.background,
      color: theme.colors.textLight,
    },
    lockedInput: {
      backgroundColor: `${theme.colors.background}80`,
      borderColor: theme.colors.border,
    },
  });

export default InputField;
