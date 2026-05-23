import React, { useState, useEffect } from "react";
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
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const navigation = useAppNavigation();

  useEffect(() => {
    if (
      user &&
      user?.displayName !== "Male" &&
      user?.displayName !== "Female" &&
      !isUpdating
    ) {
      setShowModal(true);
    }
  }, [user, isUpdating]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (showModal) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation, showModal]);

  const feed = useActiveFeed(uid!);

  const { profiles, isLoading } = feed;

  if (!theme) return null;
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <GenderModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        setIsUpdating={setIsUpdating}
      />
      <VerticalSwipeList
        profiles={profiles}
        isLoading={isLoading}
        feed={feed}
      />
    </View>
  );
}
