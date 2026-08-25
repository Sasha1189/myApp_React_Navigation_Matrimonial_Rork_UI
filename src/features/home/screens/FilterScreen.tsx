import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import {
  X,
  Calendar,
  Ruler,
  MapPin,
  Briefcase,
  HeartHandshake,
  Heart,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { FeedCache } from "../cache/feedCache";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import PickerField from "../../profile/components/form/PickerField";
import { LOOKUPS } from "../../utils/profileLookups"; // Ensure this matches your actual schema file location
import { districtOptions } from "../../profile/components/form/profileOptions"; // Kept since district handles a custom separate list

const INITIAL_FILTERS = {
  maxAge: "",
  maxHeight: "",
  np: "",
  ai: "" as number | "",
  ms: "" as number | "",
  ir: "",
};

export default function FilterScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user } = useAuth();
  const { t } = useTranslation();
  const uid = user?.uid as string;

  const [filters, setFilters] = useState(() => {
    const cached = uid ? FeedCache.getFilterParams(uid) : null;
    return cached ? { ...INITIAL_FILTERS, ...cached } : INITIAL_FILTERS;
  });

  const applyFilters = () => {
    if (!uid) return;

    const age = parseInt(filters.maxAge, 10);
    if (filters.maxAge && (age < 18 || age > 60)) {
      Alert.alert(t("filters.title"), t("filters.errors.invalidAge"), [
        { text: "OK" },
      ]);
      return;
    }

    const height = parseInt(filters.maxHeight, 10);
    if (filters.maxHeight && (height < 100 || height > 250)) {
      Alert.alert(t("filters.title"), t("filters.errors.invalidHeight"), [
        { text: "OK" },
      ]);
      return;
    }

    // Persist filter state and update active feed mode atomically via FeedCache
    FeedCache.setFilterParams(uid, filters);
    FeedCache.setMode(uid, "filter");

    navigation.goBack();
  };

  const clearFilter = () => {
    setFilters(INITIAL_FILTERS);

    if (uid) {
      FeedCache.clearFilter(uid);
    }

    navigation.goBack();
  };

  const handleNumericInput = (text: string, key: "maxAge" | "maxHeight") => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const normalized = cleaned.startsWith("0")
      ? cleaned.replace(/^0+/, "")
      : cleaned;

    const maxLength = key === "maxAge" ? 2 : 3;
    setFilters((prev) => ({ ...prev, [key]: normalized.slice(0, maxLength) }));
  };

  // Helper utility to convert array lookups into select options format on the fly
  const transformLookupToOptions = (field: keyof typeof LOOKUPS) => {
    return LOOKUPS[field].map((label, index) => ({
      label: label === "" ? t("filters.any") : label,
      value: index,
    })) as any;
  };

  const renderRow = (label: string, icon: any, component: React.ReactNode) => (
    <View style={styles.filterRow}>
      <View style={styles.labelGroup}>
        {React.createElement(icon, { size: 20, color: theme.colors.primary })}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.pickerContainer}>{component}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("filters.title")}</Text>
        <TouchableOpacity onPress={clearFilter}>
          <Text style={styles.clearText}>{t("filters.clear")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollStyle}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* MAX AGE */}
          {renderRow(
            t("filters.maxAge"),
            Calendar,
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.numericInput,
                  styles.input,
                  { color: theme.colors.text },
                ]}
                placeholder={t("filters.placeholders.age")}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="number-pad"
                value={filters.maxAge}
                onChangeText={(text) => handleNumericInput(text, "maxAge")}
                maxLength={2}
              />
            </View>,
          )}

          {/* MAX HEIGHT */}
          {renderRow(
            t("filters.maxHeight"),
            Ruler,
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.numericInput,
                  styles.input,
                  { color: theme.colors.text },
                ]}
                placeholder={t("filters.placeholders.height")}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="number-pad"
                value={filters.maxHeight}
                onChangeText={(text) => handleNumericInput(text, "maxHeight")}
                maxLength={3}
              />
            </View>,
          )}

          {/* NATIVE PLACE (DISTRICT) */}
          {renderRow(
            t("filters.nativePlace"),
            MapPin,
            <PickerField
              placeholder={t("filters.placeholders.district")}
              value={filters.np}
              options={districtOptions}
              onSelect={(val) => setFilters((p) => ({ ...p, np: val }))}
            />,
          )}

          {/* MIN INCOME (ai) */}
          {renderRow(
            t("filters.minIncome"),
            Briefcase,
            <PickerField
              placeholder={t("filters.placeholders.income")}
              value={filters.ai === "" ? "" : String(filters.ai)}
              options={transformLookupToOptions("ai")}
              onSelect={(val) => setFilters((p) => ({ ...p, ai: Number(val) }))}
            />,
          )}

          {/* MARITAL STATUS (ms) */}
          {renderRow(
            t("filters.status"),
            HeartHandshake,
            <PickerField
              placeholder={t("filters.placeholders.status")}
              value={filters.ms === "" ? "" : String(filters.ms)}
              options={transformLookupToOptions("ms")}
              onSelect={(val) => setFilters((p) => ({ ...p, ms: Number(val) }))}
            />,
          )}

          {/* IS READY (ir) */}
          {renderRow(
            t("filters.ready"),
            Heart,
            <PickerField
              placeholder={t("filters.placeholders.ready")}
              value={filters.ir}
              options={[t("filters.any"), "Yes", "No"]}
              onSelect={(val) => setFilters((p) => ({ ...p, ir: String(val) }))}
            />,
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>{t("filters.apply")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    clearText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: "600",
    },
    scrollStyle: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.xs,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    labelGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      flex: 1,
    },
    rowLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: "500",
    },
    pickerContainer: {
      flex: 1,
      maxWidth: "60%",
    },
    footer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md + 4,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
    },
    applyButtonText: {
      color: "white",
      fontSize: theme.fontSize.md,
      fontWeight: "600",
    },
    numericInput: {
      fontSize: theme.fontSize.md,
      textAlign: "right",
      fontWeight: "600",
      minWidth: 60,
      paddingVertical: 4,
    },
    inputWrapper: {
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
      minHeight: 45,
    },
  });
