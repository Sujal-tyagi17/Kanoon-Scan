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
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Playfair Display", "serif"],
        "data-mono": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"]
      },
      colors: {
        primary: {
          DEFAULT: "#ffc880",
          foreground: "#452b00"
        },
        secondary: {
          DEFAULT: "#ffb962",
          foreground: "#472a00"
        },
        tertiary: {
          DEFAULT: "#f6cf00",
          foreground: "#3a3000"
        },
        danger: "#ffb4ab",
        warning: "#ffb4ab",
        info: "#f5a623",
        "background-light": "#eae2c8",
        "background-dark": "#080600",
        "on-error": "#690005",
        "on-background": "#eae2c8",
        "on-tertiary-fixed": "#221b00",
        "on-tertiary": "#3a3000",
        "inverse-surface": "#eae2c8",
        "surface-container": "#23200f",
        "on-secondary-fixed-variant": "#663e00",
        "secondary-fixed-dim": "#ffb962",
        "surface-container-high": "#2e2a19",
        "secondary-container": "#c98114",
        "primary-container": "#f5a623",
        "on-primary-fixed-variant": "#633f00",
        "tertiary-fixed-dim": "#e9c400",
        "on-surface": "#eae2c8",
        "surface-variant": "#393523",
        "surface-bright": "#3d3927",
        "primary-fixed": "#ffddb4",
        "surface-dim": "#161305",
        "on-tertiary-fixed-variant": "#544600",
        "on-error-container": "#ffdad6",
        "error-container": "#93000a",
        "inverse-primary": "#835500",
        "on-primary-container": "#644000",
        "on-secondary": "#472a00",
        "outline-variant": "#524534",
        "tertiary-fixed": "#ffe16d",
        "surface": "#161305",
        "secondary-fixed": "#ffddb9",
        "outline": "#9f8e7a",
        "surface-container-highest": "#393523",
        "background": "#080600",
        "on-secondary-container": "#3e2400",
        "on-surface-variant": "#d7c3ae",
        "tertiary-container": "#d6b400",
        "inverse-on-surface": "#34301f",
        "on-primary-fixed": "#291800",
        "surface-container-lowest": "#110e02",
        "on-secondary-fixed": "#2b1700",
        "on-tertiary-container": "#554600",
        "surface-tint": "#ffb955",
        "surface-container-low": "#1f1c0b",
        "error": "#ffb4ab",
        "primary-fixed-dim": "#ffb955",
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
      spacing: {
        lg: "24px",
        xl: "48px",
        gutter: "24px",
        "container-max": "1280px",
        md: "16px",
        xs: "4px",
        sm: "8px",
        unit: "4px"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        full: "0.75rem",
      },
      fontSize: {
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "display-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "500" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-lg": ["48px", { "lineHeight": "56px", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "headline-md": ["32px", { "lineHeight": "40px", "fontWeight": "600" }]
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
