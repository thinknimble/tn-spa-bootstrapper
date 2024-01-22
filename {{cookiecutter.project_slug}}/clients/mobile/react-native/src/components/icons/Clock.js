import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Clock = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity="0.3"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 22C7.52944 22 3.5 17.9706 3.5 13C3.5 8.02944 7.52944 4 12.5 4C17.4706 4 21.5 8.02944 21.5 13C21.5 17.9706 17.4706 22 12.5 22Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9646 7.96165C11.9846 7.70115 12.2018 7.5 12.4631 7.5H12.5476C12.8044 7.5 13.0195 7.69465 13.0451 7.95025L13.5001 12.5L16.7481 14.356C16.9039 14.4451 17.0001 14.6107 17.0001 14.7902V14.8454C17.0001 15.1751 16.6866 15.4145 16.3685 15.3278L11.8987 14.1087C11.6673 14.0456 11.5134 13.8271 11.5318 13.588L11.9646 7.96165Z"
      fill={color}
    />
  </Svg>
)

export default Clock
