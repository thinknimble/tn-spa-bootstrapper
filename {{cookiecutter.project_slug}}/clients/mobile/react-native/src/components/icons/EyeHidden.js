import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const EyeHidden = ({ color, size, ...props }) => (
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
      d="M11.0955 17.9608C11.3879 17.9865 11.6893 18 12 18C16.909 18 21 12 21 12C21 12 20.3303 11.0179 19.2078 9.84839L11.0955 17.9608Z"
      fill={color}
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.5051 6.49485C13.7076 6.18695 12.8665 6 12 6C5.45455 6 3 12 3 12C3 12 3.75006 13.8335 5.52661 15.4734L9 12C9 10.3431 10.3431 9 12 9L14.5051 6.49485Z"
      fill={color}
    />

    <Rect
      opacity="0.3"
      x="5.1001"
      y="18.4351"
      width="19"
      height="2"
      transform="rotate(-45 5.1001 18.4351)"
      fill={color}
    />
  </Svg>
)

export default EyeHidden
