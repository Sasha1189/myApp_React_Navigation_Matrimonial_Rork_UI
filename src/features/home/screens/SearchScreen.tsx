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
import { X, Search, MapPin, GraduationCap, User } from "lucide-react-native";
import { theme } from "../../../constants/theme";
import { useNavigation } from "@react-navigation/native";

interface SearchFilters {
  name: string;
  location: string;
  education: string;
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: "",
    location: "",
    education: "",
  });

  const [recentSearches] = useState([
    "Priya Mumbai",
    "Software Engineer",
    "Delhi Graduate",
    "Bangalore MBA",
  ]);

  const handleSearch = () => {
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearchFilters({
      name: "",
      location: "",
      education: "",
    });
  };

  const handleRecentSearch = (search: string) => {
    // Parse recent search and populate filters
    setSearchFilters((prev) => ({
      ...prev,
      name: search,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={clearSearch}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Inputs */}
        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <User size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="Search by name..."
              placeholderTextColor={theme.colors.textLight}
              value={searchFilters.name}
              onChangeText={(text) =>
                setSearchFilters((prev) => ({ ...prev, name: text }))
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="Search by location..."
              placeholderTextColor={theme.colors.textLight}
              value={searchFilters.location}
              onChangeText={(text) =>
                setSearchFilters((prev) => ({ ...prev, location: text }))
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <GraduationCap size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="Search by education..."
              placeholderTextColor={theme.colors.textLight}
              value={searchFilters.education}
              onChangeText={(text) =>
                setSearchFilters((prev) => ({ ...prev, education: text }))
              }
            />
          </View>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => handleRecentSearch(search)}
            >
              <Search size={16} color={theme.colors.textLight} />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Searches */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.tagsContainer}>
            {["Engineer", "Doctor", "Mumbai", "Delhi", "MBA", "CA"].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() =>
                    setSearchFilters((prev) => ({ ...prev, education: tag }))
                  }
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={20} color="white" />
          <Text style={styles.searchButtonText}>Search</Text>
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
  searchSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  recentSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    backgroundColor: theme.colors.cardBackground,
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
    backgroundColor: theme.colors.cardBackground,
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
