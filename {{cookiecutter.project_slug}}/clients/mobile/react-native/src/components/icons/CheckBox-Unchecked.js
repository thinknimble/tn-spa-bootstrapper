import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Unchecked = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3ZM19 19V5H5V19H19Z"
      fill={color}
      fillOpacity="0.54"
    />
  </Svg>
)

export default Unchecked