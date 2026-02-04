import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        "bg": "rgb(var(--color-bg) / <alpha-value>)",
        "bg-elevated": "rgb(var(--color-bg-elevated) / <alpha-value>)",
        "panel": "rgb(var(--color-panel) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        "accent": "rgb(var(--color-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        "success": "rgb(var(--color-success) / <alpha-value>)",
        "warning": "rgb(var(--color-warning) / <alpha-value>)",
        "danger": "rgb(var(--color-danger) / <alpha-value>)"
      },
      borderRadius: {
        "xl": "var(--radius-xl)",
        "2xl": "var(--radius-2xl)"
      },
      boxShadow: {
        "soft": "0 20px 60px -20px rgba(0,0,0,0.55)",
        "glow": "0 0 60px rgba(94, 234, 212, 0.25)"
      },
      fontFamily: {
        "display": ["var(--font-display)", "system-ui", "sans-serif"],
        "body": ["var(--font-body)", "system-ui", "sans-serif"]
      },
      backdropBlur: {
        "glass": "18px"
      }
    }
  },
  plugins: []
} satisfies Config;
