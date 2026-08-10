import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { ChevronDown, X, Check } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

export interface PickerOption {
  label: string;
  value: string | number;
}

interface PickerFieldProps {
  label?: string;
  value: string | number;
  placeholder: string;
  options: readonly PickerOption[] | readonly string[];
  onSelect: (value: any) => void;
  icon?: any;
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
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [modalVisible, setModalVisible] = useState(false);

  // Normalize options array dynamically
  const normalizedOptions = React.useMemo<readonly PickerOption[]>(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt,
    );
  }, [options]);

  // Determine if the current state value counts as an empty schema assignment (0, "", null, undefined)
  const isValueEmpty =
    value === "" || value === undefined || value === null || value === 0;

  // Resolve active display label text
  const selectedLabel = React.useMemo(() => {
    if (isValueEmpty) return "";
    const found = normalizedOptions.find((opt) => opt.value === value);
    return found ? found.label : String(value);
  }, [value, normalizedOptions, isValueEmpty]);

  const handleOpen = () => {
    if (editable && !locked) setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Tinted Icon */}
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

      {/* 2. Selection Trigger Input Field box */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpen}
        style={[
          styles.trigger,
          locked && styles.lockedTrigger,
          !editable && styles.disabledTrigger,
        ]}
      >
        <Text
          style={[
            styles.valueText,
            // 🎯 FIXED BUG 1: Uses consolidated isValueEmpty to ensure 0 captures textLight styling natively
            (isValueEmpty || !editable) && { color: theme.colors.textLight },
          ]}
        >
          {selectedLabel || placeholder || `Select ${label}`}
        </Text>
        {!locked && editable && (
          <ChevronDown size={16} color={theme.colors.textLight} />
        )}
      </TouchableOpacity>

      {locked && (
        <Text style={styles.lockNote}>
          This verified field cannot be changed.
        </Text>
      )}

      {/* 3. Selection Modal Sheet List */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={normalizedOptions}
              keyExtractor={(item) => String(item.value)}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => {
                const isSelected = value === item.value;
                // 🎯 FIXED BUG 2: Detects if this item option row is the clear placeholder block (index 0 or "")
                const isOptionPlaceholder =
                  item.value === 0 || item.value === "";

                return (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <View style={{ width: 20 }} />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                        // Tint placeholder clear option row dim so user understands it resets selection
                        isOptionPlaceholder && {
                          color: theme.colors.textLight,
                          fontStyle: "italic",
                        },
                      ]}
                    >
                      {/* If the option's label is literal blank empty text, display clear hint layout text */}
                      {item.label === "" ? "Clear Selection" : item.label}
                    </Text>
                    <View style={{ width: 20, alignItems: "center" }}>
                      {isSelected && !isOptionPlaceholder && (
                        <Check size={20} color={theme.colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { marginBottom: theme.spacing.md },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    labelLeft: { flexDirection: "row", alignItems: "center" },
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
      letterSpacing: 0.4,
    },
    requiredStar: { color: theme.colors.danger },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      minHeight: 48,
    },
    lockedTrigger: { backgroundColor: `${theme.colors.background}80` },
    disabledTrigger: { opacity: 0.6 },
    valueText: { fontSize: theme.fontSize.md, color: theme.colors.text },
    lockNote: {
      color: theme.colors.textLight,
      marginTop: 4,
      fontSize: 11,
      fontStyle: "italic",
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    closeBtn: { padding: 4 },
    listPadding: { paddingBottom: 40 },
    optionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    optionText: {
      flex: 1,
      textAlign: "center",
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    selectedOptionText: { color: theme.colors.primary, fontWeight: "700" },
  });

export default PickerField;
