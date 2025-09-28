import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { theme } from "../../../../constants/theme";

interface DatePickerProps {
  label: string;
  value?: Date | string;
  placeholder?: string;
  onChange: (date?: Date) => void;
  editable?: boolean;
  icon?: React.ComponentType<any>;
  required?: boolean;
  locked?: boolean;
}

export const DatePickerField: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  editable = true,
  icon: Icon,
  required = true,
  locked = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value
      ? value instanceof Date
        ? value
        : new Date(value as string)
      : undefined
  );

  useEffect(() => {
    if (value) {
      setSelectedDate(
        value instanceof Date ? value : new Date(value as string)
      );
    }
  }, [value]);

  const display = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}/${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}/${selectedDate.getFullYear()}`
    : "";

  const handleChange = (_e: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      onChange(date);
    }
    if (Platform.OS === "android") setShowPicker(false);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        onPress={() => editable && !locked && setShowPicker(true)}
        disabled={!editable || locked}
        style={{ opacity: editable && !locked ? 1 : 0.6 }}
      >
        <View style={styles.labelRow}>
          {Icon && <Icon size={16} color={theme.colors.primary} />}
          <Text style={styles.label}>
            {label}
            {required && <Text style={{ color: "red" }}> *</Text>}
          </Text>
        </View>
        <View style={styles.input}>
          <Text
            style={{
              color: display ? theme.colors.text : theme.colors.textLight,
            }}
          >
            {display || "DD/MM/YYYY"}
          </Text>
        </View>
      </TouchableOpacity>
      <Text
        style={{
          color: theme.colors.textLight,
          marginTop: 6,
          fontSize: theme.fontSize.sm,
        }}
      >
        This cannot be changed later
      </Text>
      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date(1990, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

interface TimePickerProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (time?: string) => void;
  editable?: boolean;
  icon?: React.ComponentType<any>;
  required?: boolean;
  locked?: boolean;
}

const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

const parseTimeString = (t?: string) => {
  if (!t) return undefined;
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return undefined;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ampm = m[3];
  if (ampm) {
    const up = ampm.toUpperCase();
    if (up === "PM" && hour < 12) hour += 12;
    if (up === "AM" && hour === 12) hour = 0;
  }
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const TimePickerField: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  editable = true,
  icon: Icon,
  required = false,
  locked = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(
    value ? parseTimeString(value) : undefined
  );

  useEffect(() => {
    if (value) setSelected(parseTimeString(value));
  }, [value]);

  const display = selected ? formatTime(selected) : "";
  const handleChange = (_e: any, date?: Date) => {
    if (date) {
      setSelected(date);
      onChange(formatTime(date));
    }
    if (Platform.OS === "android") setShowPicker(false);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        onPress={() => editable && !locked && setShowPicker(true)}
        disabled={!editable || locked}
        style={{ opacity: editable && !locked ? 1 : 0.6 }}
      >
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={{ color: "red" }}> *</Text>}
          </Text>
        </View>
        <View style={styles.input}>
          <Text
            style={{
              color: display ? theme.colors.text : theme.colors.textLight,
            }}
          >
            {display || "e.g., 10:30 AM"}
          </Text>
        </View>
      </TouchableOpacity>
      {locked && (
        <Text
          style={{
            color: theme.colors.textLight,
            marginTop: 6,
            fontSize: theme.fontSize.sm,
          }}
        >
          This cannot be changed later
        </Text>
      )}
      {showPicker && (
        <DateTimePicker
          value={selected || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: 4,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "white",
    marginTop: 6,
  },
});

export default DatePickerField;
