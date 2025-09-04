import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { theme } from "../../../../constants/theme";

interface Props {
  label: string;
  options: string[];
  value: string[] | string;
  onChange: (selected: string[]) => void;
  editable?: boolean;
  icon?: React.ComponentType<any>;
}

const MultiSelectField: React.FC<Props> = ({
  label,
  options,
  value = [],
  onChange,
  editable = true,
  icon: Icon,
}) => {
  const [open, setOpen] = useState(false);

  const values = Array.isArray(value) ? value : value ? [value] : [];

  const toggleOption = (opt: string) => {
    const exists = values.includes(opt);
    const next = exists ? values.filter((v) => v !== opt) : [...values, opt];
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.label}>{label}</Text>
      </View>

      <TouchableOpacity
        style={[styles.field, !editable && styles.disabled]}
        activeOpacity={0.8}
        onPress={() => editable && setOpen(true)}
      >
        <Text
          style={values && values.length ? styles.text : styles.placeholder}
        >
          {values && values.length ? values.join(", ") : `Select ${label}`}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = values.includes(item);
                return (
                  <Pressable
                    onPress={() => toggleOption(item)}
                    style={styles.optionRow}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                    <Text style={selected ? styles.checkOn : styles.checkOff}>
                      {selected ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <Text>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  field: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: "white",
  },
  disabled: { opacity: 0.6 },
  text: { fontSize: theme.fontSize.md, color: theme.colors.text },
  placeholder: { color: theme.colors.textLight },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    maxHeight: "80%",
    padding: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  checkOn: { color: theme.colors.primary, fontSize: 18 },
  checkOff: { color: "transparent", fontSize: 18 },
  modalActions: { marginTop: theme.spacing.md, alignItems: "flex-end" },
  actionBtn: { padding: theme.spacing.sm, borderRadius: theme.borderRadius.md },
});

export default MultiSelectField;
