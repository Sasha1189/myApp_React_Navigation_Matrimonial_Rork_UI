import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../../constants/theme";

interface RadioFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: React.ComponentType<any>;
  editable?: boolean;
  required?: boolean;
  locked?: boolean;
  error?: string | null;
}

const RadioField: React.FC<RadioFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  icon: Icon,
  editable = true,
  required = false,
  locked = false,
  error = null,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: "red" }}> *</Text>}
          {/* {locked && (
            <Text style={{ color: theme.colors.textLight, marginLeft: 8 }}>
              (This cannot be changed later)
            </Text>
          )} */}
        </Text>
      </View>

      <View style={{ marginTop: 6 }}>
        {locked ? (
          <>
            <View
              style={[
                styles.option,
                {
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: "#fafafa",
                },
              ]}
            >
              <Text style={styles.optionText}>
                {value || `Select ${label}`}
              </Text>
            </View>
            <Text
              style={{
                color: theme.colors.textLight,
                marginTop: theme.spacing.xs,
                fontSize: theme.fontSize.sm,
              }}
            >
              This cannot be changed later
            </Text>
          </>
        ) : options.length === 0 ? (
          <Text style={styles.placeholder}>No options</Text>
        ) : (
          <View style={styles.optionsRow}>
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => editable && !locked && onSelect(opt)}
                  disabled={!editable || locked}
                >
                  <View
                    style={[
                      styles.circle,
                      selected && { borderColor: theme.colors.primary },
                    ]}
                  >
                    {selected && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}

            {!value && <Text style={styles.placeholder}>Select {label}</Text>}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
};

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
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: "white",
  },
  optionSelected: {
    borderColor: theme.colors.primary,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.textLight,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  placeholder: {
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  error: { color: "red", marginTop: theme.spacing.xs },
});

export default RadioField;
