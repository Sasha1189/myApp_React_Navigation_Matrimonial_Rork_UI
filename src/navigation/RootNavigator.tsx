import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import EmailSignUpScreen from "../features/auth/screens/EmailSignUpScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, authLoading } = useAuth();

  useEffect(() => {
    async function hide() {
      if (!authLoading) {
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            console.warn("Splash hide error ignored:", e);
          }
        }, 100);
      }
    }
    hide();
  }, [authLoading]);

  // Clean regular expression mapping with safe index group captures
  const getExtractedPhone = (): string => {
    if (!user || !user.email) return "";
    const match = user.email.match(/^\+91([6-9]\d{9})@/);

    // 👑 FIX 1: Safely return group index 1 string if format matches, fallback cleanly to avoid screen freeze if real emails are passed
    return match ? match[1] : "";
  };

  if (authLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !user.phoneNumber ? (
          // 👑 FIX 2: Added dynamic key mapping constraint using user.uid!
          // This forces the Stack to reset and pass fresh configuration params whenever user session tokens update.
          <Stack.Screen
            key={`force-otp-${user.uid}`}
            name="ForceOtpVerification"
            component={EmailSignUpScreen}
            initialParams={{ phoneNumber: getExtractedPhone() }}
          />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
