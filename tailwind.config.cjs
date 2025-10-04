const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'InterVariable'", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: {
          DEFAULT: "#0B7285",
          light: "#4FC3D6",
          dark: "#074450"
        }
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" }
        }
      },
      animation: {
        "pulse-slow": "pulse-slow 12s ease-in-out infinite"
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(79, 195, 214, 0.35)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
