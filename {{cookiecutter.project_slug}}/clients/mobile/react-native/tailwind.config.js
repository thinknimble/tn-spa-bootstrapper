/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'variant-black': ['Montserrat-BlackItalic'],
        'variant-italic-black': ['Montserrat-Black'],
        'variant-bold': ['Montserrat-Bold'],
        'variant-italic-bold': ['Montserrat-BoldItalic'],
        'variant-italic': ['Montserrat-Italic'],
        'variant-light': ['Montserrat-Light'],
        'variant-italic-light': ['Montserrat-LightItalic'],
        'variant-medium': ['Montserrat-Medium'],
        'variant-italic-medium': ['Montserrat-MediumItalic'],
        'variant-regular': ['Montserrat-Regular'],
      },
      colors: {
        primary: 'rgb(217,58,0)',
      },
    },
  },
  plugins: [],
}
