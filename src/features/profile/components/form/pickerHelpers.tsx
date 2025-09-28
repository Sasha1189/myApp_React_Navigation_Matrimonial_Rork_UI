import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { theme } from "../../../../constants/theme";

interface EnumPickerProps {
  value?: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  enabled?: boolean;
}

export const EnumPicker: React.FC<EnumPickerProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  enabled = true,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => enabled && setVisible(true)}
      >
        <Text style={!value ? styles.placeholderText : styles.valueText}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: "white",
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  valueText: {
    color: theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "50%",
  },
  optionItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  cancelButton: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  cancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});
