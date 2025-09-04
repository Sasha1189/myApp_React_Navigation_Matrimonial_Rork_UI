import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../../../../constants/theme";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  editable?: boolean; // when true, section is collapsible for editing
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  children,
  editable = false,
}) => {
  // start all sections collapsed regardless of `editable`
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const borderStyle = {
    borderWidth: editable && !collapsed ? 2 : 1,
    borderColor:
      editable && !collapsed ? theme.colors.primary : theme.colors.border,
  } as const;

  return (
    <View style={[styles.section, borderStyle]}>
      {/* Header is static; only the chevron toggles expand/collapse for this section */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Icon size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCollapsed((s) => !s)}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          style={styles.chevronButton}
          accessibilityRole="button"
          accessibilityLabel={`${
            collapsed ? "Expand" : "Collapse"
          } ${title} section`}
        >
          {collapsed ? (
            <ChevronDown size={20} color={theme.colors.textLight} />
          ) : (
            <ChevronUp size={20} color={theme.colors.textLight} />
          )}
        </TouchableOpacity>
      </View>
      {!collapsed && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

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
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  sectionContent: { gap: theme.spacing.md },
  chevronButton: {
    padding: theme.spacing.xs,
  },
});

export default FormSection;
