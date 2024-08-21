/** @type {import('tailwindcss').Config} */
const colors = require('./src/utils/colors')

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        'primary-black': `Montserrat-Black`,
        'primary-black-italic': `Montserrat-BlackItalic`,
        'primary-bold': `Montserrat-Bold`,
        'primary-bold-italic': `Montserrat-BoldItalic`,
        'primary-italic': `Montserrat-Italic`,
        'primary-light': `Montserrat-Light`,
        'primary-light-italic': `Montserrat-LightItalic`,
        'primary-medium': `Montserrat-Medium`,
        'primary-medium-italic': `Montserrat-MediumItalic`,
        'primary-regular': `Montserrat-Regular`,
      },
    },
  },
  plugins: [],
}
