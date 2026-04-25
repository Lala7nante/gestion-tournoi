/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d4ff',
        dark: {
          900: '#080810',
          800: '#0a0a0f',
          700: '#0f1117',
          600: '#13151f',
          500: '#1e2130',
        }
      }
    },
  },
  plugins: [],
}