import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "@/db/context/DatabaseContext";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import RootNavigator from "./navigation/RootNavigator";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function App() {
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch (configError) {
      console.error(
        "❌ [GoogleAuth Init] Failed to configure GoogleSignin:",
        configError,
      );
    }
  }, []);
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AuthProvider>
          <ProfileProvider>
            <ThemeProvider>
              <RootNavigator />
            </ThemeProvider>
          </ProfileProvider>
        </AuthProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
