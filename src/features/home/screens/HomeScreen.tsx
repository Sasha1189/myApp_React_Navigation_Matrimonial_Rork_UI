import React, { useMemo } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View, StatusBar } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useDatabase } from "@/context/DatabaseContext";
import { DatabaseErrorModal } from "@/db/recovery/DatabaseErrorModal";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { VerticalSwipeList } from "../components/VerticalSwipeList";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { isDbReady, migrationError } = useDatabase();
  const uid = user?.uid ?? "";

  usePreventScreenCapture();

  const userGender = user?.displayName?.trim().toLowerCase();
  const isGenderReady = userGender === "male" || userGender === "female";
  const isFeedReady = isGenderReady && isDbReady && !migrationError;

  const feed = useActiveFeed(isFeedReady ? uid : "");

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.background],
  );

  const { feedKey } = feed;

  if (migrationError) {
    return <DatabaseErrorModal />;
  }

  if (!isDbReady) {
    return (
      <View style={[containerStyle, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
