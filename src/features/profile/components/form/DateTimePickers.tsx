import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Lock } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

const formatDisplayDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const formatDisplayTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

interface DateTimeProps {
  label: string;
  value?: Date | string;
  placeholder?: string;
  onChange: (val?: any) => void;
  mode: "date" | "time";
  editable?: boolean;
  icon?: any;
  required?: boolean;
  locked?: boolean;
}

export const DateTimePickerField: React.FC<DateTimeProps> = ({
  label,
  value,
  onChange,
  placeholder,
  mode,
  editable = true,
  icon: Icon,
  required = false,
  locked = false,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [show, setShow] = useState(false);

  // 1. Unified Safe Parsing for both modes
  const parsedDate = value
    ? value instanceof Date
      ? value
      : new Date(value)
    : null;

  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  // 2. Dynamic Display Formatting based on mode
  const display = isValidDate
    ? mode === "date"
      ? formatDisplayDate(parsedDate!)
      : formatDisplayTime(parsedDate!)
    : "";

  // 3. Fallback configuration if field is empty
  const defaultPickerValue = isValidDate
    ? parsedDate!
    : mode === "date"
      ? new Date(1995, 0, 1)
      : new Date();

  const defaultPlaceholder = mode === "date" ? "DD/MM/YYYY" : "Select Time";

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => editable && !locked && setShow(true)}
        style={[
          styles.trigger,
          locked && styles.lockedTrigger,
          !editable && styles.disabledTrigger,
        ]}
      >
        <Text
          style={[
            styles.valueText,
            !display && { color: theme.colors.textLight },
          ]}
        >
          {display || placeholder || defaultPlaceholder}
        </Text>
      </TouchableOpacity>

      {locked && mode === "date" && (
        <Text style={styles.lockNote}>
          This verified date cannot be changed.
        </Text>
      )}

      {show && (
        <DateTimePicker
          value={defaultPickerValue}
          mode={mode} // 👈 Direct bind ("date" or "time")
          display={
            Platform.OS === "ios"
              ? "spinner"
              : mode === "date"
                ? "calendar"
                : "clock"
          }
          maximumDate={new Date()}
          onChange={(event: any, date?: Date) => {
            setShow(false);
            if (date) {
              onChange(date);
            }
          }}
        />
      )}
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
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      minHeight: 48,
      justifyContent: "center",
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
  });
