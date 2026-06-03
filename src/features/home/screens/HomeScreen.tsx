import React, { useState, useEffect } from "react";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View, StatusBar } from "react-native";
import GenderModal from "../components/GenderModal";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useAppNavigation } from "../../../navigation/hooks";
import { useActiveFeed } from "../hooks/useActiveFeed";
import { VerticalSwipeList } from "../components/VerticalSwipeList";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const uid = user?.uid as string;
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigation = useAppNavigation();
  usePreventScreenCapture();

  // 🎯 Check if the logged-in user possesses a structurally valid gender setting
  const isGenderReady =
    user?.displayName === "Male" || user?.displayName === "Female";

  useEffect(() => {
    if (user && !isGenderReady) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, isGenderReady]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (showModal) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation, showModal]);

  const feed = useActiveFeed(isGenderReady ? uid : "");

  const { profiles, isLoading } = feed;

  if (!isGenderReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          translucent={false}
          backgroundColor={theme.colors.background}
          barStyle="light-content"
        />
        <GenderModal visible={showModal} onClose={() => setShowModal(false)} />
        {/* You can optionally add a clean logo or an background brand wallpaper component frame here */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <GenderModal visible={showModal} onClose={() => setShowModal(false)} />
      <VerticalSwipeList
        profiles={profiles}
        isLoading={isLoading}
        feed={feed}
      />
    </View>
  );
}
