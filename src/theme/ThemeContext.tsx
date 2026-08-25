import React, { createContext, useContext, useState, useMemo } from "react";
import { useColorScheme } from "react-native";
import { appStorage } from "@/cacheMMKV/cacheConfig";
import { theme } from "./theme";

const THEME_KEY = "user-theme-mode";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: (typeof theme)[ThemeMode];
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() || "light";

  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = appStorage.getString(THEME_KEY);
    return (saved as ThemeMode) || systemScheme;
  });

  const value = useMemo(
    () => ({
      theme: theme[mode],
      mode,
      toggleTheme: () => {
        const nextMode = mode === "light" ? "dark" : "light";
        setMode(nextMode);
        appStorage.set(THEME_KEY, nextMode);
      },
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useAppTheme must be used within ThemeProvider");
  return context;
};
