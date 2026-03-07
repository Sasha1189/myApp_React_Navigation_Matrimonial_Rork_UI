import React from "react";
import { CacheProvider } from "./cache/CacheProvider";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./theme/useTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <CacheProvider>
        <AuthProvider>
          <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootNavigator />
            </GestureHandlerRootView>
          </ThemeProvider>
        </AuthProvider>
      </CacheProvider>
    </SafeAreaProvider>
  );
}
