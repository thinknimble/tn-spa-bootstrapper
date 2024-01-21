import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const ArrowUp = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect opacity="0.3" x="11" y="5" width="2" height="14" rx="1" fill={color} />
    <Path
      d="M6.70711 12.7071C6.31658 13.0976 5.68342 13.0976 5.29289 12.7071C4.90237 12.3166 4.90237 11.6834 5.29289 11.2929L11.2929 5.29289C11.6715 4.91432 12.2811 4.90107 12.6757 5.26285L18.6757 10.7628C19.0828 11.136 19.1103 11.7686 18.7372 12.1757C18.364 12.5828 17.7314 12.6103 17.3243 12.2372L12.0301 7.38414L6.70711 12.7071Z"
      fill={color}
    />
  </Svg>
)

export default ArrowUp
