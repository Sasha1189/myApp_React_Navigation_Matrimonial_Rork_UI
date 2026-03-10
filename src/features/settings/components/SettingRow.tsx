import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface SettingRowProps {
  title: string;
  subtitle: string;
  icon: any; // Lucide icon component
  onPress?: () => void;
  type?: "toggle" | "nav" | "danger";
  value?: boolean;
  onToggle?: (val: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  onPress,
  type = "nav",
  value,
  onToggle,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const isDanger = type === "danger";

  // Toggle rows shouldn't trigger onPress unless handled specifically
  const handlePress = () => {
    if (type !== "toggle" && onPress) onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={type === "toggle" ? 1 : 0.7}
      onPress={handlePress}
      style={styles.settingItem}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, isDanger && styles.iconDanger]}>
          <Icon
            size={18}
            color={isDanger ? theme.colors.danger : theme.colors.primary}
          />
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              isDanger && { color: theme.colors.danger },
            ]}
          >
            {title}
          </Text>
          <Text style={styles.settingSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.settingRight}>
        {type === "toggle" ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + "40",
            }}
            thumbColor={value ? theme.colors.primary : "#f4f3f4"}
          />
        ) : (
          <ChevronRight
            size={18}
            color={isDanger ? theme.colors.danger : theme.colors.textLight}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      justifyContent: "space-between",
      backgroundColor: theme.colors.card,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: `${theme.colors.primary}12`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    iconDanger: {
      backgroundColor: `${theme.colors.danger}12`,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    settingSubtitle: {
      fontSize: 12,
      color: theme.colors.textLight,
      marginTop: 2,
    },
    settingRight: {
      marginLeft: 10,
    },
  });

export default SettingRow;
