import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        w: {
          bg:      "#060C07",
          surface: "#0C1410",
          card:    "#111A12",
          gold:    "#C9A84C",
          green:   "#3DBA78",
          red:     "#E05252",
          body:    "#EDE9E1",
          muted:   "#7A9175",
        },
        polygon: { purple: "#8247E5", light: "#a970ff" },
        willow: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0",
          300: "#86efac", 400: "#4ade80", 500: "#22c55e",
          600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans:     ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "12px", input: "8px", chip: "6px" },
      boxShadow: {
        card:  "0 0 0 1px rgba(201,168,76,0.12)",
        cardHover: "0 0 0 1px rgba(201,168,76,0.22)",
        gold:  "0 0 20px rgba(201,168,76,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
