/**
 * Design tokens matching the web app (Tailwind/jupiter style)
 */
export const colors = {
  bg: {
    primary: "#0D0D0F",
    secondary: "#1A1A1F",
    tertiary: "#232329",
  },
  accent: {
    primary: "#00D4AA",
    buy: "#00C853",
    sell: "#FF3B5C",
    light: "#33DDBA",
    dark: "#00A888",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#8A8A8E",
    muted: "#5A5A5E",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
  border: "rgba(255, 255, 255, 0.1)",
  borderHover: "rgba(255, 255, 255, 0.2)",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
} as const;
