import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { LOOKUPS } from "@/features/utils/profileLookups"; // Enforce path to your profile lookup definitions
import { Profile } from "../../../../types/profile"; // Enforce path to your profile schema

interface ProgressBarProps {
  data: Profile | undefined | null;
  trackedFields: readonly (keyof Profile)[]; // Type-safe layout arrays mapping directly to Profile properties
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

      // Check 1: Handle null, undefined, or empty text strings
      if (val === null || val === undefined || val === "") return false;

      // Check 2: Evaluate fields using global LOOKUPS dictionary rules
      if (key in LOOKUPS) {
        const lookupField = key as keyof typeof LOOKUPS;
        const index = typeof val === "number" ? val : Number(val);

        // Index is out of bounds or resolves to a blank select option placeholder ""
        if (!LOOKUPS[lookupField] || LOOKUPS[lookupField][index] === "") {
          return false;
        }
        return true;
      }

      // Check 3: Check dynamic array values (like hobbies selection arrays)
      if (Array.isArray(val) && val.length === 0) return false;

      return true;
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
  container: { marginVertical: 4, width: "100%" }, // Slightly condensed vertical margin for clean dashboard fit
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
