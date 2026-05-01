import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
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
  editable,
  required,
  locked,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
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

        {locked && (
          <View style={styles.lockBadge}>
            <Lock size={10} color={theme.colors.success} />
            <Text style={styles.lockBadgeText}>Verified</Text>
          </View>
        )}
      </View>

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
        />
      </View>

      {locked && (
        <Text style={styles.lockNote}>
          This field is verified and cannot be changed.
        </Text>
      )}
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
      borderRadius: theme.borderRadius.sm,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.4, // Match premium text spacing
    },
    requiredStar: {
      color: theme.colors.danger,
    },
    lockBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${theme.colors.success}10`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.round,
    },
    lockBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.success,
      marginLeft: 4,
      textTransform: "uppercase",
    },
    inputWrapper: {
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
      minHeight: 45,
    },
    multiline: {
      minHeight: 45, // Starts small
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
    lockNote: {
      color: theme.colors.textLight,
      marginTop: 6,
      fontSize: 11,
      fontStyle: "italic",
      paddingLeft: 2,
    },
  });

export default InputField;
