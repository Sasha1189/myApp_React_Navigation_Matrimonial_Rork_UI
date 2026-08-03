import React from "react";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View, StatusBar } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { VerticalSwipeList } from "../components/VerticalSwipeList";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const uid = user?.uid as string;

  usePreventScreenCapture();

  // 🎯 Check if the logged-in user possesses a structurally valid gender setting
  const isGenderReady =
    user?.displayName === "Male" || user?.displayName === "Female";

  const feed = useActiveFeed(isGenderReady ? uid : "");

  const { profiles, isLoading } = feed;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <VerticalSwipeList
        profiles={profiles}
        isLoading={isLoading}
        feed={feed}
      />
    </View>
  );
}
