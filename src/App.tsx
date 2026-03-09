import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { CacheProvider } from "./cache/CacheProvider";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <CacheProvider>
        <AuthProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </AuthProvider>
      </CacheProvider>
    </SafeAreaProvider>
  );
}
