/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'variant-black': ['Montserrat-BlackItalic'],
        'variant-black-italic': ['Montserrat-Black'],
        'variant-bold': ['Montserrat-Bold'],
        'variant-bold-italic': ['Montserrat-BoldItalic'],
        'variant-italic': ['Montserrat-Italic'],
        'variant-light': ['Montserrat-Light'],
        'variant-light-italic': ['Montserrat-LightItalic'],
        'variant-medium': ['Montserrat-Medium'],
        'variant-medium-italic': ['Montserrat-MediumItalic'],
        'variant-regular': ['Montserrat-Regular'],
      },
      colors: {
        primary: 'rgb(217,58,0)',
      },
    },
  },
  plugins: [],
}
