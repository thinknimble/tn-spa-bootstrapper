const colors = require('tailwindcss/colors')

module.exports = {
  mode:"jit",
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
   
    extend: {
      fontFamily:{
        body: ['Roboto', 'sans-serif',],
        heading: ['Roboto', 'sans-serif',],
      },
      fontSize:{
          'sm':'1rem',
          'xsm':'14px'
      },
      colors:{
          teal: colors.teal,
          cyan: colors.cyan,
          blue: {
            light: '#2c67ab',
            DEFAULT: '#2c67ab',
            dark: '#2c67ab',
          }
      },
      keyframes: {
        'bounce-left': {
          '0%, 100%': { transform: 'translateX(-25%)',animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': {  transform: 'translateX(0)',animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        }
       },
       animation: {
        'bounce-left': 'bounce-left 1s ease-in-out infinite',
       },
      
    },
  },
  variants: {
    extend: {
      opacity: ['disabled','group-hover'],
      translate: ['group-hover'],
      borderColor: ['group-focus'],
      ringColor: ['group-focus'],
      ringWidth: ['group-focus'],
      display:['group-hover']

    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
