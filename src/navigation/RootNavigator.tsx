import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import UserInfoScreen from "../features/auth/screens/UserInfoScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

console.log("🔍 [NAV FILE] RootNavigator.tsx module loaded");

export default function RootNavigator() {
  console.log("🔍 [NAV COMPONENT] RootNavigator component executing");
  const { user, authLoading } = useAuth();

  console.log(
    "🔍 [NAV 1/3] Render RootNavigator | authLoading:",
    authLoading,
    "| user:",
    user?.uid ?? "null",
  );

  useEffect(() => {
    async function hide() {
      if (!authLoading) {
        console.log("🔍 [NAV 2/3] Triggering SplashScreen.hideAsync()...");
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log("🔍 [NAV 3/3] SplashScreen hidden successfully.");
          } catch (e) {
            console.error("❌ [NAV ERROR] Splash hide failed:", e);
          }
        }, 100);
      }
    }
    hide();
  }, [authLoading]);

  if (authLoading) {
    console.log("⚠️ [NAV STUCK] Blocking render because authLoading is TRUE");
    return null;
  }

  const isProfileIncomplete = user && !user.displayName;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isProfileIncomplete ? (
          <Stack.Screen name="UserInfo" component={UserInfoScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
