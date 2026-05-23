import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";
import { ChevronRight } from "lucide-react-native"; // Changed to Right Arrow
import { ProfileProgressBar } from "./ProfileProgressBar";

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  data: any;
  fields: readonly string[];
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  onPress,
  data,
  fields,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        {/* Icon Wrapper: Centred and Tinted */}
        <View style={styles.iconWrapper}>
          <Icon size={18} color={theme.colors.primary} />
        </View>

        {/* Text Area: Centred vertically with letter spacing */}
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.progressWrapper}>
            <ProfileProgressBar
              data={data}
              trackedFields={fields}
              showCount={false}
            />
          </View>
        </View>

        {/* Right Arrow: Perfectly centred */}
        <View style={styles.chevronWrapper}>
          <ChevronRight size={18} color={theme.colors.textLight} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md, // Balanced padding, not too tight
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center", // Align everything (Icon, Text, Arrow) to the vertical center
      justifyContent: "space-between",
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: `${theme.colors.primary}12`, // Subtle 12% opacity tint
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.5, // Better readability like RHF demo
      marginBottom: 4,
    },
    progressWrapper: {
      marginTop: 2,
    },
    chevronWrapper: {
      marginLeft: theme.spacing.sm,
      justifyContent: "center",
    },
  });

export default FormSection;
