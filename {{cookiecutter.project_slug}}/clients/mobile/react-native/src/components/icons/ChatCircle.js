import React from 'react'
import Svg, { Path } from 'react-native-svg'

const ChatCircle = ({ color, size, ...props }) => (
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
      d="M5 15L3 21.5L9.5 19.5L5 15Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 21C18.7467 21 23 16.7467 23 11.5C23 6.25329 18.7467 2 13.5 2C8.25329 2 4 6.25329 4 11.5C4 16.7467 8.25329 21 13.5 21ZM8 9C8 8.44772 8.44772 8 9 8H18C18.5523 8 19 8.44772 19 9C19 9.55228 18.5523 10 18 10H9C8.44771 10 8 9.55228 8 9ZM9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14H14C14.5523 14 15 13.5523 15 13C15 12.4477 14.5523 12 14 12H9Z"
      fill={color}
    />
  </Svg>
)

export default ChatCircle
