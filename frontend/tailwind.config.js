/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          green: '#166534',
          deep: '#14532D',
        },
        fresh: {
          green: '#22C55E',
        },
        soft: {
          mint: '#DCFCE7',
        },
        warm: {
          offwhite: '#F8FAF5',
        },
        main: {
          text: '#17231C',
        },
        secondary: {
          text: '#647067',
        },
        warning: {
          amber: '#D97706',
        },
        error: {
          red: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
