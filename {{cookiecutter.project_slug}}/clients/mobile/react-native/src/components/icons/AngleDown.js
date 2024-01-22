import React from 'react'
import Svg, { Path } from 'react-native-svg'

const AngleDown = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3285 16.0857 11.7189 16.0989 11.3243 15.7372L5.32428 10.2372C4.91716 9.86396 4.88965 9.23139 5.26285 8.82427C5.63604 8.41716 6.26861 8.38965 6.67572 8.76284L11.9699 13.6159L17.2929 8.29289Z"
      fill={color}
    />
  </Svg>
)

export default AngleDown
