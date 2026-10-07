import React, { useMemo } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View, StatusBar } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useDatabase } from "@/db/context/DatabaseContext";
import { DatabaseErrorModal } from "@/db/recovery/DatabaseErrorModal";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { VerticalSwipeList } from "../components/VerticalSwipeList";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { isDbReady, migrationError } = useDatabase();
  const uid = user?.uid ?? "";

  const isFeedReady = isDbReady && !migrationError;

  const feed = useActiveFeed(isFeedReady ? uid : "");

  const { feedKey } = feed;

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.background],
  );

  console.log("[HomeScreen hit]");

  usePreventScreenCapture();

  console.log(
    "[Homescreen]- feed:length - loading - mode",
    feed?.profiles?.length,
    feed?.isLoading,
    feed?.mode,
  );

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
