/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f8ff",
          100: "#d7e8ff",
          200: "#b1d1ff",
          300: "#8abaff",
          400: "#5ea0ff",
          500: "#2f85ff",
          600: "#1e66d1",
          700: "#154a9f",
          800: "#0e346d",
          900: "#071b3b"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
