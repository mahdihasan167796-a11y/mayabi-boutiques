import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#c9a054",
          light: "#f3e7c4",
          dark: "#8a6829",
        },
        maroon: "#7a121d",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "var(--font-noto-serif-bengali)", "serif"],
        sans: ["var(--font-plus-jakarta)", "var(--font-hind-siliguri)", "sans-serif"],
      },
      boxShadow: {
        "glow-amber": "0 0 0 1px rgba(245,158,11,0.15), 0 20px 45px -20px rgba(245,158,11,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;