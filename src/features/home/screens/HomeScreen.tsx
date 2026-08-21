import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View, StatusBar } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { VerticalSwipeList } from "../components/VerticalSwipeList";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const uid = user?.uid ?? "";

  usePreventScreenCapture();

  const userGender = user?.displayName?.trim().toLowerCase();
  const isGenderReady = userGender === "male" || userGender === "female";

  const feed = useActiveFeed(isGenderReady ? uid : "");

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.background],
  );

  const { feedKey } = feed;

  return (
    <View style={containerStyle}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <VerticalSwipeList key={feedKey} feed={feed} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
