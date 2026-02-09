import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CEX-style color system (Bloomberg Terminal + Coinbase Pro aesthetic)
        bg: {
          primary: "#0D0D0F", // Deep black background
          secondary: "#1A1A1F", // Card dark
          tertiary: "#232329", // Elevated dark
        },
        // Accent colors (Institutional teal/green) + shadcn compatibility
        accent: {
          primary: "#00D4AA", // Brand teal
          buy: "#00C853", // Vibrant green for buy/long
          sell: "#FF3B5C", // Vibrant red for sell/short
          light: "#33DDBA",
          dark: "#00A888",
          glow: "rgba(0, 212, 170, 0.2)",
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Text hierarchy
        text: {
          primary: "#FFFFFF",
          secondary: "#8A8A8E",
          muted: "#5A5A5E",
          disabled: "rgba(255, 255, 255, 0.3)",
        },
        // Chart colors (CEX + shadcn)
        chart: {
          green: "#00C853",
          red: "#FF3B5C",
          grid: "#1F1F24",
          bg: "#0D0D0F",
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Legacy Jupiter colors (for backward compatibility)
        jupiter: {
          bg: "#0D0D0F",
          surface: "#1A1A1F",
          surfaceHover: "#232329",
          border: "rgba(255, 255, 255, 0.1)",
          borderHover: "rgba(255, 255, 255, 0.2)",
          text: {
            primary: "#FFFFFF",
            secondary: "#8A8A8E",
            tertiary: "#5A5A5E",
            disabled: "rgba(255, 255, 255, 0.3)",
          },
          accent: {
            DEFAULT: "#00D4AA",
            light: "#33DDBA",
            dark: "#00A888",
            glow: "rgba(0, 212, 170, 0.2)",
          },
          success: {
            DEFAULT: "#00C853",
            dim: "#00A844",
            bg: "rgba(0, 200, 83, 0.1)",
          },
          error: {
            DEFAULT: "#FF3B5C",
            dim: "#E02E4A",
            bg: "rgba(255, 59, 92, 0.1)",
          },
          warning: {
            DEFAULT: "#FFB84D",
            bg: "rgba(255, 184, 77, 0.1)",
          },
        },
        // Keep shadcn colors for compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-2xl": ["4rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-xl": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-lg": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-xl": ["1.25rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["1.125rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.4", fontWeight: "400" }],
        "body-xs": ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "jupiter": "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "jupiter-glow": "0 0 40px rgba(153, 69, 255, 0.3), 0 0 80px rgba(153, 69, 255, 0.1)",
        "jupiter-success": "0 0 20px rgba(20, 241, 149, 0.2)",
        "jupiter-error": "0 0 20px rgba(255, 107, 107, 0.2)",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "40px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient": "gradient 3s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
