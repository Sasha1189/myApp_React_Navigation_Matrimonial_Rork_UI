import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import UserInfoScreen from "../features/auth/screens/UserInfoScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, gender, authLoading } = useAuth();

  useEffect(() => {
    async function hideSplash() {
      if (!authLoading) {
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            console.error("❌ [NAV ERROR] Splash hide failed:", e);
          }
        }, 100);
      }
    }
    hideSplash();
  }, [authLoading]);

  if (authLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !gender ? (
          <Stack.Screen name="UserInfo" component={UserInfoScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
