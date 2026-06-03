import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  X,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Heart,
  Ruler,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { storage } from "@/cache/cacheConfig";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import PickerField from "../../profile/components/form/PickerField";

// Import your existing options
import {
  districtOptions,
  annualIncomeOptions,
  maritalStatusOptions,
  isReady as isReadyOptions,
} from "../../profile/components/form/profileOptions";

export default function FilterScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { user } = useAuth();
  const { t } = useTranslation();
  const uid = user?.uid as string;

  const [filters, setFilters] = useState({
    maxAge: "",
    maxHeight: "",
    nativePlace: "",
    minIncome: "",
    maritalStatus: "",
    isReady: "",
  });

  const applyFilters = () => {
    const age = parseInt(filters.maxAge);
    if (filters.maxAge && (age < 18 || age > 60)) {
      Alert.alert(
        t("filters.title"), // Alert Header
        t("filters.errors.invalidAge"), // Error Message
        [{ text: "OK" }],
      );
      return;
    }

    const height = parseInt(filters.maxHeight);
    if (filters.maxHeight && (height < 100 || height > 250)) {
      Alert.alert(t("filters.title"), t("filters.errors.invalidHeight"), [
        { text: "OK" },
      ]);
      return;
    }

    storage.set(`active_filter_params_${uid}`, JSON.stringify(filters));
    storage.set(`active_mode_${uid}`, "filter");
    navigation.goBack();
  };

  const clearFilter = () => {
    setFilters({
      maxAge: "",
      maxHeight: "",
      nativePlace: "",
      minIncome: "",
      maritalStatus: "",
      isReady: "",
    });

    storage.set(`active_mode_${uid}`, "default");
    storage.remove(`active_filter_params_${uid}`);
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
          {/* 
          {renderRow(
            t("filters.nativePlace"),
            MapPin,
            <PickerField
              placeholder={t("filters.placeholders.district")}
              value={filters.nativePlace}
              options={districtOptions}
              onSelect={(val) =>
                setFilters((p) => ({ ...p, nativePlace: val }))
              }
            />,
          )}

          {renderRow(
            t("filters.minIncome"),
            Briefcase,
            <PickerField
              placeholder={t("filters.placeholders.income")}
              value={filters.minIncome}
              options={annualIncomeOptions}
              onSelect={(val) => setFilters((p) => ({ ...p, minIncome: val }))}
            />,
          )}

          {renderRow(
            t("filters.status"),
            HeartHandshake,
            <PickerField
              placeholder={t("filters.placeholders.status")}
              value={filters.maritalStatus}
              options={maritalStatusOptions}
              onSelect={(val) =>
                setFilters((p) => ({ ...p, maritalStatus: val }))
              }
            />,
          )}

          {renderRow(
            t("filters.ready"),
            Heart,
            <PickerField
              placeholder={t("filters.placeholders.ready")}
              value={filters.isReady}
              options={isReadyOptions}
              onSelect={(val) => setFilters((p) => ({ ...p, isReady: val }))}
            />,
          )} */}
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
