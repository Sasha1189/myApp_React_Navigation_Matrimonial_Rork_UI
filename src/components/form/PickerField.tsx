import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../constants/theme";

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: React.ComponentType<any>;
  editable?: boolean;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  icon: Icon,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.label}>{label}</Text>
      </View>

      <View
        style={[styles.pickerContainer, !editable && { opacity: 0.6 }]}
        pointerEvents={editable ? "auto" : "none"}
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
});

export default PickerField;
