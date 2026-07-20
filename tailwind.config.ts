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
    },
  },
  plugins: [],
};

export default config;
