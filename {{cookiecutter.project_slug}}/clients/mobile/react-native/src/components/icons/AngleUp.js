import React from 'react'
import Svg, { Path } from 'react-native-svg'

const AngleUp = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289C11.6715 7.91432 12.2811 7.90107 12.6757 8.26285L18.6757 13.7628C19.0828 14.136 19.1103 14.7686 18.7372 15.1757C18.364 15.5828 17.7314 15.6103 17.3243 15.2372L12.0301 10.3841L6.70711 15.7071Z"
      fill={color}
    />
  </Svg>
)

export default AngleUp
