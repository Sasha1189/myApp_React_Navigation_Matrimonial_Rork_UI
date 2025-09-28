import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../../../constants/theme";

interface PickerFieldProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: React.ComponentType<any>;
  editable?: boolean;
  required?: boolean;
  locked?: boolean;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  icon: Icon,
  editable = true,
  required = false,
  locked = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: "red" }}> *</Text>}
        </Text>
      </View>

      {locked ? (
        <>
          <View
            style={[
              styles.pickerContainer,
              { padding: 12, backgroundColor: "#fafafa" },
            ]}
          >
            <Text
              style={{
                color: value ? theme.colors.text : theme.colors.textLight,
              }}
            >
              {value || `Select ${label}`}
            </Text>
          </View>
          <Text style={styles.lockNote}>This cannot be changed later</Text>
        </>
      ) : (
        <View
          style={[styles.pickerContainer, !editable && { opacity: 0.6 }]}
          pointerEvents={!editable ? "none" : "auto"}
        >
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => onSelect(String(itemValue))}
            mode="dropdown"
          >
            <Picker.Item label={`Select ${label}`} value="" />
            {options.map((option, i) => (
              <Picker.Item key={i} label={option} value={option} />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.sm },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: "white",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "white",
    marginBottom: theme.spacing.sm,
  },
  text: { fontSize: theme.fontSize.md, color: theme.colors.text },
  placeholder: { color: theme.colors.textLight },
  options: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "white",
    marginTop: theme.spacing.xs,
    maxHeight: 200,
  },
  optionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  lockNote: {
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
  },
});

export default PickerField;
