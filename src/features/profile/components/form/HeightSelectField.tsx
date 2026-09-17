import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ruler, ChevronDown, X, Check } from "lucide-react-native";
import { cmToFeetInches, HEIGHT_OPTIONS } from "./height";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface HeightPickerFieldProps {
  label?: string;
  value?: number; // Height stored in CM
  onChange: (cmValue: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const HeightPickerField: React.FC<HeightPickerFieldProps> = ({
  label = "Height",
  value,
  onChange,
  placeholder = "Select Height",
  error,
  required = false,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedInfo = cmToFeetInches(value);
  const isValueEmpty = !value || value === 0;

  // Calculate index of selected height for auto-scrolling
  const selectedIndex = useMemo(() => {
    if (!value) return -1;
    return HEIGHT_OPTIONS.findIndex((item) => item.cm === value);
  }, [value]);

  return (
    <View style={styles.container}>
      {/* 1. Header Label with Tinted Icon */}
      {label && (
        <View style={styles.labelRow}>
          <View style={styles.labelLeft}>
            <View style={styles.iconWrapper}>
              <Ruler size={14} color={theme.colors.primary} />
            </View>
            <Text style={styles.label}>
              {label}
              {required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
          </View>
        </View>
      )}

      {/* 2. Selection Trigger Input Field Box */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
      >
        <Text
          style={[
            styles.valueText,
            isValueEmpty && { color: theme.colors.textLight },
          ]}
        >
          {selectedInfo.label || placeholder}
        </Text>
        <ChevronDown size={16} color={theme.colors.textLight} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* 3. Selection Modal Sheet */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header with Title & Close X Icon */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Heights List */}
            <FlatList
              data={HEIGHT_OPTIONS}
              keyExtractor={(item) => item.cm.toString()}
              contentContainerStyle={styles.listPadding}
              initialScrollIndex={selectedIndex > -1 ? selectedIndex : 0}
              getItemLayout={(_, index) => ({
                length: 44,
                offset: 44 * index,
                index,
              })}
              renderItem={({ item }) => {
                const isSelected = value === item.cm;

                return (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      onChange(item.cm);
                      setModalVisible(false);
                    }}
                  >
                    <View style={{ width: 24 }} />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {item.feet} ft {item.inches} in
                    </Text>

                    <View style={styles.chevronWrapper}>
                      {isSelected && (
                        <ChevronDown size={16} color={theme.colors.textLight} />
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
      borderRadius: theme.borderRadius.xs,
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
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.card,
      minHeight: 40,
      position: "relative",
      marginTop: theme.spacing.xs,
    },
    triggerError: { borderColor: theme.colors.danger },
    valueText: {
      flex: 1,
      textAlign: "center",
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    chevronWrapper: {
      position: "absolute", // 👈 Keeps chevron on the right without affecting text centering
      right: theme.spacing.md,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: 4,
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
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    optionText: {
      flex: 1,
      textAlign: "center",
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
  });

export default HeightPickerField;
