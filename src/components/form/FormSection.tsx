import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  children,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Icon size={20} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  sectionContent: { gap: theme.spacing.md },
});

export default FormSection;
