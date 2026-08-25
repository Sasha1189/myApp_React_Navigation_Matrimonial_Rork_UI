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

export default function RootNavigator() {
  const { user, authLoading } = useAuth();

  useEffect(() => {
    async function hide() {
      if (!authLoading) {
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (e) {}
        }, 100);
      }
    }
    hide();
  }, [authLoading]);

  if (authLoading) return null;

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
