import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  safelist: [
    // NASA Colors
    'bg-nasa-blue', 'bg-nasa-red', 'text-nasa-blue', 'text-nasa-red', 'text-nasa-white',
    'from-nasa-blue', 'from-nasa-red', 'to-nasa-blue', 'to-nasa-red',
    'border-nasa-blue', 'border-nasa-red', 'via-nasa-blue',
    // Common utilities that might be dynamic
    'backdrop-blur-xl', 'shadow-2xl', 'rounded-3xl'
  ],
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
        },
        nasa: {
          blue: "#0B3D91",
          red: "#FC3D21",
          white: "#FFFFFF",
          black: "#000000",
          gray: "#4F4F4F"
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
  plugins: [forms]
};

export default config;
