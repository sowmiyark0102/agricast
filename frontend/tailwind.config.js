/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        agri: {
          green: "#1F5F3F",
          forest: "#14402B",
          light: "#E7F0E4",
          offwhite: "#F6F6F1",
          soil: "#8B5E34",
          blue: "#3E6B8A",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "serif"],
        sans: ["Inter", "Noto Sans Tamil", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
