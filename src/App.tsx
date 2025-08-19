import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme/useTheme";
import { AppProvider } from "./hooks/useAppStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import RootNavigator from "./navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
     <ThemeProvider>
      <AppProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootNavigator />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
