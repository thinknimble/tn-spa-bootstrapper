import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const User = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.5 3C9.01472 3 7 5.01472 7 7.5V12H5.5C4.67157 12 4 12.6716 4 13.5C4 14.3284 4.67157 15 5.5 15H18.5C19.3284 15 20 14.3284 20 13.5C20 12.6716 19.3284 12 18.5 12H17V7.5C17 5.01472 14.9853 3 12.5 3H11.5Z"
      fill={color}
    />
    <Rect opacity="0.3" x="10" y="16" width="4" height="4" rx="2" fill={color} />
  </Svg>
)

export default User
