/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kubera: {
          burgundy: '#781226',
          maroon: '#5B0E1B',
          darkWine: '#3D0812',
          gold: '#C59B27',
          goldLight: '#FBF5E5',
          goldMuted: '#9B7C22',
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          surface: '#F1F5F9',
          surfaceLight: '#F8FAFC',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif']
      },
      boxShadow: {
        'card-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'burgundy-glow': '0 4px 14px 0 rgba(120, 18, 38, 0.25)',
        'gold-glow': '0 4px 14px 0 rgba(197, 155, 39, 0.2)'
      }
    },
  },
  plugins: [],
}
