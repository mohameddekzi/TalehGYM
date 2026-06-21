import type { Config } from "tailwindcss";

/**
 * Taleh GYM design tokens.
 * Brand palette is derived directly from the official logo:
 *   - Orange (energy / primary action)   #F58220
 *   - Green  (the "TALEH" wordmark)        #16C13A
 *   - Blue   (the "GYM" wordmark)          #1E2ED1
 * The product UI uses a deep, premium dark theme as the canvas.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic, theme-aware tokens (driven by CSS vars in globals.css).
        // These flip between light and dark; brand colors stay constant.
        background: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        foreground: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        brand: {
          orange: "#F58220",
          "orange-dark": "#D96A0C",
          green: "#16C13A",
          "green-dark": "#0F9C2D",
          blue: "#1E2ED1",
          "blue-dark": "#1622A6",
        },
        ink: {
          950: "#0A0A0B",
          900: "#101013",
          850: "#16161A",
          800: "#1C1C22",
          700: "#26262E",
          600: "#33333D",
          500: "#4A4A57",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,130,32,0.25), 0 18px 50px -12px rgba(245,130,32,0.35)",
        card: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -20px rgba(0,0,0,0.25)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #F58220 0%, #16C13A 55%, #1E2ED1 100%)",
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
