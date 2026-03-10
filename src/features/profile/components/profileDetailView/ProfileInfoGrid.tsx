import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface DetailRowProps {
  label: string;
  value?: any;
  icon?: React.ComponentType<any>;
  fullWidth?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  icon: Icon,
  fullWidth = false,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  if (value === undefined || value === null || value === "" || value === 0)
    return null;

  return (
    <View
      style={[styles.detailRow, fullWidth ? styles.fullRow : styles.halfRow]}
    >
      <View style={styles.iconWrapper}>
        {Icon && <Icon size={14} color={theme.colors.primary} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {String(value)}
        </Text>
      </View>
    </View>
  );
};

export const DetailSection: React.FC<{
  title: string;
  icon: any;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={18} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.grid}>{children}</View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 8,
      color: theme.colors.text,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 4,
      marginBottom: 12,
    },
    halfRow: { width: "50%" },
    fullRow: { width: "100%" },
    iconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    textContainer: { flex: 1 },
    detailLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 2,
    },
    detailValue: { fontSize: 13, color: theme.colors.text, fontWeight: "600" },
  });
