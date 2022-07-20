/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        black: '#000000',
        success: '#4faf64',
        warning: '#f4b942',
        error: '#d72638',
        primary: '#042642',
        accent: '#f16158',
      },
    },
  },
  plugins: [],
}
