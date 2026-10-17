import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          500: "#2b7fff",
          600: "#1663d6",
          700: "#124ea8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
