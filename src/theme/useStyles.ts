import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useAppTheme } from "./ThemeContext";
import { AppTheme } from "./theme";

// This takes a function that returns a StyleSheet
export const useStyles = <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(
  createStyles: (theme: AppTheme) => T,
) => {
  const { theme } = useAppTheme();

  // Only re-run the StyleSheet.create when the 'theme' object actually changes
  return useMemo(() => createStyles(theme), [theme, createStyles]);
};
