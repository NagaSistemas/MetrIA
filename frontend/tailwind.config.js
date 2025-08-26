/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'metria-black': '#0D0D0D',
        'metria-gold': '#D4AF37',
        'metria-gray': '#2C2C2C',
        'metria-white': '#F5F5F5',
        'metria-emerald': '#046D63',
        'gold': '#D4AF37',
      },
      fontFamily: {
        'serif': ['Cinzel', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}