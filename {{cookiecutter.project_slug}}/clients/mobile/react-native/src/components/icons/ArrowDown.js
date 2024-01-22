import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const ArrowDown = ({ color, size, ...props }) => (
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
      d="M6.70711 11.2929C6.31658 10.9024 5.68342 10.9024 5.29289 11.2929C4.90237 11.6834 4.90237 12.3166 5.29289 12.7071L11.2929 18.7071C11.6715 19.0857 12.2811 19.0989 12.6757 18.7372L18.6757 13.2372C19.0828 12.864 19.1103 12.2314 18.7372 11.8243C18.364 11.4172 17.7314 11.3897 17.3243 11.7628L12.0301 16.6159L6.70711 11.2929Z"
      fill={color}
    />
  </Svg>
)

export default ArrowDown
