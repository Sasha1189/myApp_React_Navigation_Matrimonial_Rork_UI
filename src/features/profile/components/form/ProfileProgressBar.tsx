import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

interface ProgressBarProps {
  data: any;
  trackedFields: readonly string[];
  label?: string;
  showCount?: boolean;
}

export const ProfileProgressBar = ({
  data,
  trackedFields,
  label,
  showCount = false,
}: ProgressBarProps) => {
  const { theme } = useAppTheme();

  const stats = useMemo(() => {
    if (!data) return { percent: 0, filled: 0, total: trackedFields.length };

    const total = trackedFields.length;
    const filled = trackedFields.filter((key) => {
      const val = data[key];
      // Check for non-empty values (strings, arrays, numbers)
      return (
        val !== null &&
        val !== undefined &&
        val !== "" &&
        (Array.isArray(val) ? val.length > 0 : true)
      );
    }).length;

    return {
      percent: total > 0 ? (filled / total) * 100 : 0,
      filled,
      total,
    };
  }, [data, trackedFields]);

  return (
    <View style={styles.container}>
      {(label || showCount) && (
        <View style={styles.header}>
          {label && (
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {label}
            </Text>
          )}
          {showCount && (
            <Text style={[styles.count, { color: theme.colors.primary }]}>
              {stats.filled}/{stats.total}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.border,
            borderRadius: theme.borderRadius.sm,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${stats.percent}%`,
              backgroundColor: theme.colors.tint,
              borderRadius: theme.borderRadius.sm,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: "100%" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "600" },
  count: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
});
