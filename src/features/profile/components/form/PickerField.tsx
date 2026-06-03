import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { ChevronDown, X, Check, Lock } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface PickerFieldProps {
  label?: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  onSelect: (value: string) => void;
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

  const handleOpen = () => {
    if (editable && !locked) setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Tinted Icon & Verified Badge */}
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

      {/* 2. Selection Trigger */}
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
            !value && { color: theme.colors.textLight },
            !editable && { color: theme.colors.textLight },
          ]}
        >
          {value || placeholder || `Select ${label}`}
        </Text>
        {!locked && editable && (
          <ChevronDown size={18} color={theme.colors.textLight} />
        )}
      </TouchableOpacity>

      {locked && (
        <Text style={styles.lockNote}>
          This verified field cannot be changed.
        </Text>
      )}

      {/* 3. Selection Modal (Clean List) */}
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
              data={options}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
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
    lockBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${theme.colors.success}10`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 100,
    },
    lockBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.success,
      marginLeft: 4,
      textTransform: "uppercase",
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
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
      padding: theme.spacing.lg,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    optionText: { fontSize: theme.fontSize.md, color: theme.colors.text },
    selectedOptionText: { color: theme.colors.primary, fontWeight: "700" },
  });

export default PickerField;
