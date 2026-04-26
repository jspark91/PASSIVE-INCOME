import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f3ef",
          100: "#ebe0d6",
          300: "#bda58f",
          700: "#554234",
          900: "#241b17"
        },
        moss: {
          500: "#66785f",
          700: "#3d4c38"
        }
      },
      boxShadow: {
        soft: "0 16px 48px rgba(36, 27, 23, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

