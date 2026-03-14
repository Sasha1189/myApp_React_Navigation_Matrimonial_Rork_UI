import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import PaywallScreen from "@/features/subscription/screens/PaywallScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, authLoading, tier } = useAuth();

  useEffect(() => {
    async function hide() {
      if (!authLoading) {
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    hide();
  }, [authLoading]);

  if (authLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : tier === "none" ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
