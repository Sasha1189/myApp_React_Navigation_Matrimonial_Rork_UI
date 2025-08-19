import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { theme } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

export const EmptyState = ({ title, subtitle, buttonText, onButtonPress }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <RefreshCw size={20} color="white" />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold", color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textLight, marginVertical: 8 },
  button: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  buttonText: { color: "white", marginLeft: 8 },
});
