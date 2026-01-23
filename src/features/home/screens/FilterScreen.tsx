import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from 'expo-router';
import {
  X,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
} from "lucide-react-native";
import { theme } from "../../../constants/theme";
import { useNavigation } from "@react-navigation/native";

interface FilterState {
  ageRange: [number, number];
  location: string[];
  education: string[];
  income: string[];
}

export default function FilterScreen() {
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [21, 35],
    location: [],
    education: [],
    income: [],
  });
  const navigation = useNavigation();

  const locations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Pune",
    "Hyderabad",
  ];
  const educationLevels = [
    "Graduate",
    "Post Graduate",
    "PhD",
    "Professional Degree",
  ];
  const incomeRanges = ["₹3L+", "₹5L+", "₹10L+", "₹15L+", "₹25L+", "₹50L+"];

  const toggleSelection = (category: keyof FilterState, value: string) => {
    if (category === "ageRange") return;

    setFilters((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter((item) => item !== value)
        : [...(prev[category] as string[]), value],
    }));
  };

  const applyFilters = () => {
    navigation.goBack();
  };

  const clearFilters = () => {
    setFilters({
      ageRange: [21, 35],
      location: [],
      education: [],
      income: [],
    });
  };

  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    items: string[],
    selectedItems: string[],
    category: keyof FilterState,
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              selectedItems.includes(item) && styles.selectedOption,
            ]}
            onPress={() => toggleSelection(category, item)}
          >
            <Text
              style={[
                styles.optionText,
                selectedItems.includes(item) && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Age Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Age Range</Text>
          </View>
          <View style={styles.ageRangeContainer}>
            <Text style={styles.ageRangeText}>
              {filters.ageRange[0]} - {filters.ageRange[1]} years
            </Text>
          </View>
        </View>

        {/* Location */}
        {renderFilterSection(
          "Location",
          <MapPin size={20} color={theme.colors.primary} />,
          locations,
          filters.location,
          "location",
        )}

        {/* Education */}
        {renderFilterSection(
          "Education",
          <GraduationCap size={20} color={theme.colors.primary} />,
          educationLevels,
          filters.education,
          "education",
        )}

        {/* Income */}
        {renderFilterSection(
          "Income",
          <DollarSign size={20} color={theme.colors.primary} />,
          incomeRanges,
          filters.income,
          "income",
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.cardBackground,
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
  section: {
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  ageRangeContainer: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ageRangeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: "white",
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
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
});
