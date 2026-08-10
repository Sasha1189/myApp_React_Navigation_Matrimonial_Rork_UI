import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface MenuItem {
  icon: any;
  label: string;
  onPress: () => void;
}

interface MenuSectionProps {
  menuItems: MenuItem[];
  theme: any;
  styles: any;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  theme,
  styles,
}) => {
  return (
    <View style={styles.menuContainer}>
      {menuItems.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.menuItem}
          onPress={item.onPress}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconWrapper}>
              <item.icon size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.colors.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  );
};
