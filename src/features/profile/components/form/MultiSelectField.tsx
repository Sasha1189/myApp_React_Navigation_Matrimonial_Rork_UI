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
import { X, Check, ChevronDown } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface MultiSelectProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (selected: string[]) => void;
  editable?: boolean;
  icon?: any;
  placeholder?: string;
}

const MultiSelectField: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  editable = true,
  icon: Icon,
  placeholder,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [open, setOpen] = useState(false);

  const toggleOption = (opt: string) => {
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt];
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Tinted Icon */}
      <View style={styles.labelRow}>
        {Icon && (
          <View style={styles.iconWrapper}>
            <Icon size={14} color={theme.colors.primary} />
          </View>
        )}
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* 2. Trigger Field with Chips */}
      <TouchableOpacity
        style={[styles.trigger, !editable && styles.disabled]}
        activeOpacity={0.7}
        onPress={() => editable && setOpen(true)}
      >
        <View style={styles.chipContainer}>
          {value.length > 0 ? (
            value.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>
              {placeholder || `Select ${label}`}
            </Text>
          )}
        </View>
        <ChevronDown size={18} color={theme.colors.textLight} />
      </TouchableOpacity>

      {/* 3. Selection Modal (Bottom Sheet Style) */}
      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => {
                const isSelected = value.includes(item);
                return (
                  <Pressable
                    onPress={() => toggleOption(item)}
                    style={styles.optionRow}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                      ]}
                    >
                      {isSelected && <Check size={14} color="white" />}
                    </View>
                  </Pressable>
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
      marginBottom: theme.spacing.xs,
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
      letterSpacing: 0.4,
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      minHeight: 48,
    },
    disabled: { opacity: 0.6 },
    chipContainer: { flexDirection: "row", flexWrap: "wrap", flex: 1, gap: 4 },
    chip: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: `${theme.colors.primary}30`,
    },
    chipText: { fontSize: 12, color: theme.colors.primary, fontWeight: "600" },
    placeholder: {
      color: theme.colors.textLight,
      fontSize: theme.fontSize.md,
      marginLeft: 4,
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
      maxHeight: "75%",
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
    doneBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    doneBtnText: { color: "white", fontWeight: "bold" },
    listPadding: { paddingBottom: 40 },
    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    optionText: { fontSize: theme.fontSize.md, color: theme.colors.text },
    selectedOptionText: { color: theme.colors.primary, fontWeight: "600" },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  });

export default MultiSelectField;
