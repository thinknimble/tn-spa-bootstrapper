/** @type {import('tailwindcss').Config} */
const { colors } = require('./tailwind-colors')

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors,
      zIndex: {
        infinity: '9999',
      },
    },
  },
  plugins: [],
}
