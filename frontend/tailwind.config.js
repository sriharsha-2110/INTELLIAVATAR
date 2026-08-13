/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff',
          600: '#2644eb',
          700: '#1b30c9',
          800: '#1525a3',
          900: '#122085',
        },
        dark: {
          50: '#a3a3a3',
          100: '#737373',
          200: '#525252',
          300: '#404040',
          400: '#262626',
          500: '#171717',
          600: '#0a0a0a',
          950: '#030303',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
