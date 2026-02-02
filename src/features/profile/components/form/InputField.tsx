import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import { theme } from "../../../../constants/theme";

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
}) => (
  <View style={styles.container}>
    <View style={styles.labelRow}>
      {Icon && <Icon size={16} color={theme.colors.primary} />}
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: "red" }}> *</Text>}
      </Text>
      {locked && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Lock size={12} color={theme.colors.warning} />
          <Text style={[styles.lockNote, { marginTop: 0, marginLeft: 4 }]}>
            Verified
          </Text>
        </View>
      )}
    </View>

    {locked ? (
      <>
        <View
          style={[
            styles.input,
            multiline && styles.multiline,
            { backgroundColor: "#fafafa" },
          ]}
        >
          <Text
            style={{
              color: value ? theme.colors.text : theme.colors.textLight,
            }}
          >
            {value || placeholder || "-"}
          </Text>
        </View>
        <Text style={styles.lockNote}>This cannot be changed later</Text>
      </>
    ) : (
      <>
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
      </>
    )}
    {locked && editable && (
      <Text style={[styles.lockNote, { color: theme.colors.warning }]}>
        This field is locked for security
      </Text>
    )}
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
  lockNote: {
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
  },
});

export default InputField;
