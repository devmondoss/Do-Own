import type { Config } from "tailwindcss";

// Loaded explicitly by @config in globals.css (Tailwind 4).
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        "secondary-dark": "var(--secondary-dark)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        surface: "var(--surface)",
        lavender: "var(--lavender)",
        mint: "var(--mint)",
        line: "var(--line)",
      },
      fontFamily: { sans: ["Plus Jakarta Sans Variable", "sans-serif"] },
      borderRadius: {
        sm: ".5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 8px 24px -4px rgb(124 58 237 / .08), 0 2px 6px -1px rgb(15 23 42 / .03)",
        floating:
          "0 20px 32px -8px rgb(124 58 237 / .16), 0 4px 12px -2px rgb(15 23 42 / .04)",
        button: "0 8px 20px -4px rgb(124 58 237 / .30)",
      },
      spacing: {
        margin: "1.25rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
      },
    },
  },
} satisfies Config;
