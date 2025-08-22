import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme/useTheme";
import { AppProvider } from "./hooks/useAppStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import RootNavigator from "./navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootNavigator />
                </GestureHandlerRootView>
              </AppProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
