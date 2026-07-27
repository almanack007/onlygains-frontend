/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support theme toggles via .theme-light / dark class or standard Tailwind dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}
