/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    colors: {
      white: '#ffffff',
      black: '#000000',
      success: '#4faf64',
      warning: '#f4b942',
      error: '#d72638',
      primary: '#042642',
      accent: '#d93a00',
    },
    fontFamily: {
      avenir: ['Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}
