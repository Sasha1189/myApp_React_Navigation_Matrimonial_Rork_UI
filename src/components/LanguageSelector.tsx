import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { storage } from "../cache/cacheConfig";

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    storage.set("user_language", lang);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleLanguageChange("en")}>
        <Text style={[styles.text, currentLang === "en" && styles.active]}>
          English
        </Text>
      </TouchableOpacity>
      <Text style={styles.separator}>|</Text>
      <TouchableOpacity onPress={() => handleLanguageChange("mr")}>
        <Text style={[styles.text, currentLang === "mr" && styles.active]}>
          मराठी
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  active: {
    color: "#ffa500", // Your app theme orange
    fontWeight: "bold",
  },
  separator: {
    marginHorizontal: 12,
    color: "#ccc",
  },
});
