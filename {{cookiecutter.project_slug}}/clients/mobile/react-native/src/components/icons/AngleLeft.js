import React from 'react'
import Svg, { Path } from 'react-native-svg'

const AngleLeft = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M15.7071 6.70711C16.0976 6.31658 16.0976 5.68342 15.7071 5.29289C15.3166 4.90237 14.6834 4.90237 14.2929 5.29289L8.29289 11.2929C7.91432 11.6715 7.90107 12.2811 8.26285 12.6757L13.7628 18.6757C14.136 19.0828 14.7686 19.1103 15.1757 18.7372C15.5828 18.364 15.6103 17.7314 15.2372 17.3243L10.3841 12.0301L15.7071 6.70711Z"
      fill={color}
    />
  </Svg>
)

export default AngleLeft
