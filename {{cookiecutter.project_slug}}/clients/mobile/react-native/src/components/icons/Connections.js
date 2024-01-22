import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Connections = ({ color, size, ...props }) => (
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
      d="M5 7C5 9.20914 6.79086 11 9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7ZM15 11C15 12.6569 16.3431 14 18 14C19.6569 14 21 12.6569 21 11C21 9.34315 19.6569 8 18 8C16.3431 8 15 9.34315 15 11Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.98334 13C4.26191 13 0.388259 15.4265 0.000651684 20.1992C-0.0204618 20.4592 0.476712 21 0.727502 21H17.2467C17.9979 21 18.0096 20.3955 17.9979 20.2C17.7049 15.2932 13.7712 13 8.98334 13ZM23.4559 21H19.6C19.6 18.7491 18.8563 16.6718 17.6012 15.0006C21.0077 15.0379 23.7892 16.7601 23.9985 20.4C24.0069 20.5466 23.9985 21 23.4559 21Z"
      fill={color}
    />
  </Svg>
)

export default Connections
