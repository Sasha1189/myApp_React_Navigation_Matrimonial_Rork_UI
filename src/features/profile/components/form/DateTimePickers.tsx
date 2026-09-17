import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

const formatDisplayDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`;
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
  value?: number | Date | string;
  placeholder?: string;
  onChange: (val?: number) => void;
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

  // 1. Safely parse input (number/timestamp, string, or Date) into a valid JS Date instance
  const parsedDate = value
    ? typeof value === "number"
      ? new Date(value)
      : value instanceof Date
        ? value
        : new Date(value)
    : null;

  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  // 2. Format UI display text
  const display = isValidDate
    ? mode === "date"
      ? formatDisplayDate(parsedDate!)
      : formatDisplayTime(parsedDate!)
    : "";

  // 3. Fallback date for picker opening state
  const defaultPickerValue = isValidDate
    ? parsedDate!
    : mode === "date"
      ? new Date(2000, 0, 1)
      : new Date();

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);

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

      {show && (
        <DateTimePicker
          value={defaultPickerValue}
          mode={mode}
          display={
            Platform.OS === "ios"
              ? "spinner"
              : mode === "date"
                ? "calendar"
                : "clock"
          }
          maximumDate={mode === "date" ? eighteenYearsAgo : undefined}
          minimumDate={mode === "date" ? fiftyYearsAgo : undefined}
          onChange={(event: any, selectedDate?: Date) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate.getTime());
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
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.card,
      minHeight: 40,
      marginTop: theme.spacing.xs,
    },
    lockedTrigger: { backgroundColor: `${theme.colors.background}80` },
    disabledTrigger: { opacity: 0.6 },
    valueText: {
      textAlign: "center",
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    lockNote: {
      color: theme.colors.textLight,
      marginTop: 4,
      fontSize: 11,
      fontStyle: "italic",
    },
  });
