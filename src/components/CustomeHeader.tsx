import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
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
    <>
      {/* Ensure status bar matches header color */}
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.primary,
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
          },
        ]}
      >
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={onBack}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title, { color: "white" }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>
          {showRightIcon && (
            <TouchableOpacity
              onPress={onIconClick}
              activeOpacity={0.7}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`${title} action`}
            >
              <View style={styles.actionPill}>{rightIcon}</View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
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
    // paddingTop is applied inline for Android status bar height
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  right: {
    minWidth: 110,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    gap: 8,
  },
});
