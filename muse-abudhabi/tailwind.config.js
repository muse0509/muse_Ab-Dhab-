// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Noto Sans JP", "sans-serif"],
      },
      colors: {
        axis: {
          bg: "#020617", // slate-950 ベース
          card: "#020817",
          accent: "#4ade80", // アクセント
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15,23,42,0.75)",
      },
    },
  },
  plugins: [],
};
