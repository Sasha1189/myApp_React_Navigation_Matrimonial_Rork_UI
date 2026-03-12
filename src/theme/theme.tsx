//new code
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 24, round: 999 };
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 32 };

const lightColors = {
  primary: "#6B46C1",
  primaryDark: "#4C63D2",
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#2C3E50",
  textLight: "#7F8C8D",
  border: "#E1E8ED",
  tint: "#0a7ea4",
  danger: "#F44336",
  success: "#4CAF50",
  warning: "#FFC107",
  shadow: "#000000",
  accent: "#FF6B9D",
  primaryLight: "",
};

const darkColors = {
  primary: "#9F7AEA",
  background: "#151718",
  card: "#1E1E1E",
  text: "#ECEDEE",
  textLight: "#9BA1A6",
  border: "#333333",
  tint: "#fff",
  danger: "#F44336",
  success: "#4CAF50",
  shadow: "#000000",
  accent: "#FF6B9D",
};

export const theme = {
  light: { colors: lightColors, spacing, borderRadius, fontSize },
  dark: { colors: darkColors, spacing, borderRadius, fontSize },
};

export type AppTheme = typeof theme.light;
