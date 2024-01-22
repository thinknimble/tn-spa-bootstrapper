import React from 'react'
import Svg, { Path } from 'react-native-svg'

const AngleRight = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M8.29289 6.70711C7.90237 6.31658 7.90237 5.68342 8.29289 5.29289C8.68342 4.90237 9.31658 4.90237 9.70711 5.29289L15.7071 11.2929C16.0857 11.6715 16.0989 12.2811 15.7372 12.6757L10.2372 18.6757C9.86396 19.0828 9.23139 19.1103 8.82427 18.7372C8.41716 18.364 8.38965 17.7314 8.76284 17.3243L13.6159 12.0301L8.29289 6.70711Z"
      fill={color}
    />
  </Svg>
)

export default AngleRight
