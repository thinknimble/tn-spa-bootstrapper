import React from 'react'
import Svg, { Rect } from 'react-native-svg'

const Close = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      x="5.63623"
      y="16.9498"
      width="16"
      height="2"
      rx="1"
      transform="rotate(-45 5.63623 16.9498)"
      fill={color}
    />
    <Rect
      opacity="0.3"
      x="7.05029"
      y="5.63605"
      width="16"
      height="2"
      rx="1"
      transform="rotate(45 7.05029 5.63605)"
      fill={color}
    />
  </Svg>
)

export default Close
