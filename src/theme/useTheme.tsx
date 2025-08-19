import React from "react";
import { createContext, useContext, useState, useMemo } from "react";
import { lightColors, darkColors } from "./colors";
import { colors, spacing, borderRadius, fontSize, typography } from "./theme";
import type { Theme } from "./types";

// ✅ Create context with correct type
const ThemeContext = createContext<Theme | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme: Theme = useMemo(() => {
    const colorstheme = mode === "light" ? lightColors : darkColors;
    return {
      colors,
      colorstheme,
      spacing,
      borderRadius,
      fontSize,
      typography,
      mode,
      toggleTheme: () => setMode((m) => (m === "light" ? "dark" : "light")),
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Custom hook to consume theme
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

// //consume
// // import { useTheme } from "../../theme";
// // const theme = useTheme();