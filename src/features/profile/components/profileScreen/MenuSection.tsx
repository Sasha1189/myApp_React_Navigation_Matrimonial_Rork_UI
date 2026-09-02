import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  SquarePen,
  Eye,
  Camera,
  IdCard,
  ChevronRight,
} from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useStyles } from "@/theme/useStyles";
import { AppTheme } from "@/theme/theme";

interface MenuSectionProps {
  myProfile: any;
  navigation: any;
  t: (key: string) => string;
  styles: any;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  myProfile,
  navigation,
  t,
  styles,
}) => {
  return (
    <View style={styles.menuContainer}>
      <SettingRow
        icon={SquarePen}
        title={t("profile.editProfile")}
        onPress={() => navigation.navigate("EditProfile")}
      />
      <View style={styles.divider} />
      <SettingRow
        icon={Eye}
        title={t("profile.viewPreview")}
        onPress={() =>
          myProfile && navigation.navigate("Details", { profile: myProfile })
        }
      />
      <View style={styles.divider} />
      <SettingRow
        icon={Camera}
        title={t("profile.managePhotos")}
        onPress={() => navigation.navigate("ManagePhotos")}
      />
      <View style={styles.divider} />
      <SettingRow
        icon={IdCard}
        title={t("profile.addVerDoc")}
        onPress={() => navigation.navigate("ManageVerDoc")}
      />
    </View>
  );
};

//........
interface SettingRowProps {
  title: string;
  subtitle?: string;
  icon: any;
  onPress?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  onPress,
}) => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.settingItem}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer]}>
          <Icon size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle]}>{title}</Text>
          <Text style={styles.settingSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.settingRight}>
        <ChevronRight size={18} color={theme.colors.textLight} />
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 20,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
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
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    settingSubtitle: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
    },
    settingRight: {
      marginLeft: 10,
    },
  });
