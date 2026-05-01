import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Search,
  MapPin,
  Calendar,
  User,
  Sparkles,
  Clock,
} from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { storage } from "../../../cache/cacheConfig";
import PickerField from "@/features/profile/components/form/PickerField";
import { useTranslation } from "react-i18next";

export default function SearchScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const uid = user?.uid as string;

  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  // 1. Search Configuration
  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Icon map for the header display
  const iconMap: Record<string, any> = {
    name: User,
    location: MapPin,
    age: Calendar,
  };

  // 2. Actions
  // const handleSearch = () => {
  //   if (!searchQuery.trim()) return;

  //   storage.set(`search_field_${uid}`, searchField);
  //   storage.set(`search_query_${uid}`, searchQuery.trim());
  //   storage.set(`active_mode_${uid}`, "search");
  //   navigation.goBack();
  // };
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Write to storage - Hook will react to these instantly
    storage.set(`search_field_${uid}`, searchField);
    storage.set(`search_query_${uid}`, searchQuery.trim());
    storage.set(`active_mode_${uid}`, "search");

    navigation.goBack();
  };

  const handleLatest = () => {
    storage.set(`active_mode_${uid}`, "latest");
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchField("name");
    storage.set(`active_mode_${uid}`, "default");
    storage.remove(`search_field_${uid}`);
    storage.remove(`search_query_${uid}`);
    navigation.goBack();
  };

  if (!theme) return null;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("search.title")}</Text>
        <TouchableOpacity onPress={clearSearch}>
          <Text style={styles.clearText}>{t("search.clear")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.latestButtonExtra]}
            onPress={handleLatest}
          >
            <Clock size={20} color={theme.colors.primary} />
            <Text
              style={[
                styles.recentText,
                { color: theme.colors.primary, fontWeight: "600" },
              ]}
            >
              {t("search.latestAction")}
            </Text>
            <Sparkles size={16} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{t("search.criteriaTitle")}</Text>

          {/* Field Selection (Picker) */}
          <PickerField
            label={t("search.searchBy")}
            placeholder={t("search.placeholderSelect")}
            value={searchField.charAt(0).toUpperCase() + searchField.slice(1)}
            options={[
              "fullName",
              "currentCity",
              "highestQualification",
              "occupation",
            ]}
            onSelect={(val) => setSearchField(val.toLowerCase())}
            icon={iconMap[searchField] || User}
          />

          {/* Single Query Input */}
          <View style={styles.inputContainer}>
            <Search size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder={t(`search.placeholders.${searchField}`)}
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={20} color="white" />
          <Text style={styles.searchButtonText}>{t("search.button")}</Text>
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
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    clearText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    searchSection: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    latestButtonExtra: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "0A", // Very subtle primary tint
      justifyContent: "center",
      gap: theme.spacing.sm,
      borderStyle: "dashed",
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: theme.spacing.md,
    },
    recentText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    popularSection: {
      marginTop: theme.spacing.xl,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    tag: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.round,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    footer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    searchButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md + 4,
      borderRadius: theme.borderRadius.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    searchButtonText: {
      color: "white",
      fontSize: theme.fontSize.md,
      fontWeight: "600",
    },
  });
