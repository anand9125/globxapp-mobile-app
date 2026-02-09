// Design tokens for CEX-style trading platform
// Centralized design system values

export const tokens = {
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  },
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.3)",
    elevated: "0 4px 16px rgba(0, 0, 0, 0.4)",
    glow: "0 0 20px rgba(0, 212, 170, 0.2)",
    "glow-buy": "0 0 20px rgba(0, 200, 83, 0.2)",
    "glow-sell": "0 0 20px rgba(255, 59, 92, 0.2)",
  },
  transitions: {
    fast: "150ms ease-out",
    normal: "250ms ease-out",
    slow: "350ms ease-out",
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type Spacing = keyof typeof tokens.spacing;
export type BorderRadius = keyof typeof tokens.borderRadius;
export type Shadow = keyof typeof tokens.shadows;
export type Transition = keyof typeof tokens.transitions;
