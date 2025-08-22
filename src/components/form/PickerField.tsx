import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { theme } from "../../constants/theme";

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: React.ComponentType<any>;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  icon: Icon,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || `Select ${label}`}
        </Text>
        <ChevronDown size={20} color={theme.colors.textLight} />
      </TouchableOpacity>
      {showOptions && (
        <View style={styles.options}>
          {options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionItem}
              onPress={() => {
                onSelect(option);
                setShowOptions(false);
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
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
