import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        "button-label": ["var(--font-inter)", "sans-serif"],
        "headline-lg": ["var(--font-inter)", "sans-serif"],
        "body-md": ["var(--font-inter)", "sans-serif"],
        "legal-text": ["var(--font-source-serif)", "serif"],
        "body-lg": ["var(--font-inter)", "sans-serif"],
        "headline-lg-mobile": ["var(--font-inter)", "sans-serif"],
        "headline-xl": ["var(--font-inter)", "sans-serif"],
        "headline-md": ["var(--font-inter)", "sans-serif"],
        "data-label": ["var(--font-jetbrains-mono)", "monospace"]
      },
      colors: {
        primary: {
          DEFAULT: "#b4c5ff",
          foreground: "#002a78"
        },
        secondary: {
          DEFAULT: "#b6c4ff",
          foreground: "#05297a"
        },
        tertiary: {
          DEFAULT: "#4edea3",
          foreground: "#003824"
        },
        danger: "#ffb4ab",
        warning: "#ffb4ab",
        info: "#2563eb",
        "background-light": "#f8f7f5",
        "background-dark": "#0b1326",
        "on-error": "#690005",
        "on-background": "#dae2fd",
        "on-tertiary-fixed": "#002113",
        "on-tertiary": "#003824",
        "inverse-surface": "#dae2fd",
        "surface-container": "#171f33",
        "on-secondary-fixed-variant": "#264191",
        "secondary-fixed-dim": "#b6c4ff",
        "surface-container-high": "#222a3d",
        "secondary-container": "#264191",
        "primary-container": "#2563eb",
        "on-primary-fixed-variant": "#003ea8",
        "tertiary-fixed-dim": "#4edea3",
        "on-surface": "#dae2fd",
        "surface-variant": "#2d3449",
        "surface-bright": "#31394d",
        "primary-fixed": "#dbe1ff",
        "surface-dim": "#0b1326",
        "on-tertiary-fixed-variant": "#005236",
        "on-error-container": "#ffdad6",
        "error-container": "#93000a",
        "inverse-primary": "#0053db",
        "on-primary-container": "#eeefff",
        "on-secondary": "#05297a",
        "outline-variant": "#434655",
        "tertiary-fixed": "#6ffbbe",
        "surface": "#0b1326",
        "secondary-fixed": "#dce1ff",
        "outline": "#8d90a0",
        "surface-container-highest": "#2d3449",
        "background": "#0b1326",
        "on-secondary-container": "#9db2ff",
        "on-surface-variant": "#c3c6d7",
        "tertiary-container": "#007d55",
        "inverse-on-surface": "#283044",
        "on-primary-fixed": "#00174b",
        "surface-container-lowest": "#060e20",
        "on-secondary-fixed": "#00164e",
        "on-tertiary-container": "#bdffdb",
        "surface-tint": "#b4c5ff",
        "surface-container-low": "#131b2e",
        "error": "#ffb4ab",
        "primary-fixed-dim": "#b4c5ff",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
