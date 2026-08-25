import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Edit3, Eye, Camera, ChevronRight } from "lucide-react-native";

// 1. Single reusable item component
interface MenuItemProps {
  icon: any;
  label: string;
  onPress: () => void;
  theme: any;
  styles: any;
}

export const MenuItemComponent: React.FC<MenuItemProps> = ({
  icon: IconComponent,
  label,
  onPress,
  theme,
  styles,
}) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconWrapper}>
          <IconComponent size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.menuLabel}>{label}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={theme.colors.textLight} />
    </TouchableOpacity>
  );
};

// 2. Main section component calling the item 3 times directly
interface MenuSectionProps {
  myProfile: any;
  navigation: any;
  t: (key: string) => string;
  theme: any;
  styles: any;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  myProfile,
  navigation,
  t,
  theme,
  styles,
}) => {
  return (
    <View style={styles.menuContainer}>
      {/* Edit Profile */}
      <MenuItemComponent
        icon={Edit3}
        label={t("profile.editProfile")}
        onPress={() => navigation.navigate("EditProfile")}
        theme={theme}
        styles={styles}
      />

      {/* View Preview */}
      <MenuItemComponent
        icon={Eye}
        label={t("profile.viewPreview")}
        onPress={() =>
          myProfile && navigation.navigate("Details", { profile: myProfile })
        }
        theme={theme}
        styles={styles}
      />

      {/* Manage Photos */}
      <MenuItemComponent
        icon={Camera}
        label={t("profile.managePhotos")}
        onPress={() => navigation.navigate("ManagePhotos")}
        theme={theme}
        styles={styles}
      />
    </View>
  );
};
