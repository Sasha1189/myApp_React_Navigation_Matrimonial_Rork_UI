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
import { X, Search, MapPin, User, Sparkles, Clock } from "lucide-react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { FeedCache } from "../cache/feedCache";
import PickerField from "@/features/profile/components/form/PickerField";
import { useTranslation } from "react-i18next";

type SearchFieldType = "fullName" | "currentCity";

export default function SearchScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const uid = user?.uid as string;

  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();

  // 1. Search Configuration
  const [searchField, setSearchField] = useState<SearchFieldType>("fullName");
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Icon map for the header display
  const iconMap: Record<SearchFieldType, any> = {
    fullName: User,
    currentCity: MapPin,
  };

  // Options configuration matching translation setup keys
  const searchOptions = [
    { label: t("search.fields.fullName", "Full Name"), value: "fullName" },
    {
      label: t("search.fields.currentCity", "Current City"),
      value: "currentCity",
    },
  ];

  // 3. Actions
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    FeedCache.setSearchField(uid, searchField);
    FeedCache.setSearchQuery(uid, searchQuery.trim());
    FeedCache.setMode(uid, "search");

    navigation.goBack();
  };

  const handleLatest = () => {
    FeedCache.setMode(uid, "latest");
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchField("fullName");

    if (uid) {
      FeedCache.clearSearch(uid);
    }
    navigation.goBack();
  };

  if (!theme) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("search.title")}</Text>
        <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
          <Text style={styles.clearText}>{t("search.clear")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Prevents losing focus on tap
      >
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.latestButtonExtra]}
            onPress={handleLatest}
            activeOpacity={0.8}
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

          {/* Field Selection (Picker) with clean object options mapping */}
          <PickerField
            label={t("search.searchBy")}
            placeholder={t("search.placeholderSelect")}
            value={
              searchOptions.find((opt) => opt.value === searchField)?.label ||
              ""
            }
            options={searchOptions.map((opt) => opt.value)}
            onSelect={(val) => setSearchField(val as SearchFieldType)}
            icon={iconMap[searchField] || User}
          />

          {/* Single Query Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              {React.createElement(iconMap[searchField] || Search, {
                size: 20,
                color: theme.colors.textLight,
              })}
            </View>
            <TextInput
              style={styles.input}
              placeholder={t(`search.placeholders.${searchField}`)}
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCorrect={false}
              autoCapitalize={searchField === "fullName" ? "words" : "none"}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
              >
                <X size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.searchButton,
            !searchQuery.trim() && { opacity: 0.5 }, // Visual disabled helper status
          ]}
          onPress={handleSearch}
          disabled={!searchQuery.trim()}
          activeOpacity={0.8}
        >
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
      color: theme.colors.text,
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
      backgroundColor: theme.colors.primary + "0A",
      justifyContent: "center",
      gap: theme.spacing.sm,
      borderStyle: "dashed",
    },
    inputIconWrapper: {
      marginRight: theme.spacing.xs,
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
      paddingVertical: 0,
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
