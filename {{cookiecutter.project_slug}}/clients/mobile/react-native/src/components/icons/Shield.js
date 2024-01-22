import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Shield = ({ color, size, ...props }) => (
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
      d="M0 1.5L7.63142 0.0691067C7.87502 0.0234325 8.12498 0.0234325 8.36858 0.0691067L16 1.5V9.40327C16 13.196 14.0462 16.7211 10.83 18.7313L8.53 20.1687C8.20573 20.3714 7.79427 20.3714 7.47 20.1687L5.17001 18.7313C1.95382 16.7211 0 13.196 0 9.40327L0 1.5Z"
      fill={color}
    />
  </Svg>
)

export default Shield
