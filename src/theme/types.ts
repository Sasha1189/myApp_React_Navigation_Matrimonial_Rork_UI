import { colors,spacing, borderRadius, fontSize, typography } from "./theme";
import { lightColors } from "./colors";

export type Theme = {
  colors: typeof colors;
  colorstheme: typeof lightColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSize: typeof fontSize;
  typography: typeof typography;
  mode: "light" | "dark";
  toggleTheme: () => void;
};
