/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finora: {
          50: '#f6fdf0',
          100: '#ecfae0',
          200: '#daf6c3',
          300: '#c1ee9e',
          400: '#a7e672',
          500: '#92DF4F',
          600: '#70C428',
          700: '#55981d',
          800: '#437718',
          900: '#386317',
          950: '#1b3807',
        },
        income: '#00C950',
        expense: '#F34C4C',
        dark: {
          bg: '#1C1D23',
          card: '#21232B',
          cardSecondary: '#2D3139',
          border: '#2F3748',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

