import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "@/db/context/DatabaseContext";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import { AppSyncListeners } from "@/components/AppSyncListeners";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Replace with your Web Client ID from Google Cloud Console / Firebase Console
// const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  console.log("🔍 [APP] App root rendering...");
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: GOOGLE_WEB_CLIENT_ID,
  //     offlineAccess: false, // Set to true if you need server-side auth tokens
  //   });
  // }, []);
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AuthProvider>
          <ProfileProvider>
            <ThemeProvider>
              <AppSyncListeners>
                <RootNavigator />
              </AppSyncListeners>
            </ThemeProvider>
          </ProfileProvider>
        </AuthProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
