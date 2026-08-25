import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "@/context/DatabaseContext";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import { AppSyncListeners } from "@/components/AppSyncListeners";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

import RootNavigator from "./navigation/RootNavigator";

export default function App() {
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
