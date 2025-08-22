import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  icon?: React.ComponentType<any>;
  editable?: boolean;
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
}) => (
  <View style={styles.container}>
    <View style={styles.labelRow}>
      {Icon && <Icon size={16} color={theme.colors.primary} />}
      <Text style={styles.label}>{label}</Text>
    </View>
    <TextInput
      style={[styles.input, multiline && styles.multiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textLight}
      multiline={multiline}
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.sm },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "white",
  },
  multiline: { height: 80, textAlignVertical: "top" },
});

export default InputField;
