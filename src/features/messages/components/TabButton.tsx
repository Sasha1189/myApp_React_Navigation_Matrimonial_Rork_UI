import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { theme } from "../../../theme/index";
import { styles } from "../screens/MessagesScreen";

interface TabButtonProps {
  tab: "chats" | "sent" | "received";
  label: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onPress: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  tab,
  label,
  icon: Icon,
  isActive,
  onPress,
}) => {
  //   const styles = styles;

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Icon size={16} color={isActive ? "white" : theme.colors.primary} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
