import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "../theme";

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showRightIcon?: boolean;
  rightIcon?: React.ReactNode;
  onIconClick?: () => void;
};

export default function CustomHeader({
  title,
  showBack = true,
  onBack,
  showRightIcon = false,
  rightIcon,
  onIconClick,
}: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: "white" }]}>{title}</Text>

      <View style={styles.right}>
        {showRightIcon && (
          <TouchableOpacity onPress={onIconClick}>{rightIcon}</TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    elevation: 4,
    marginTop: 20,
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  right: {
    width: 40,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
