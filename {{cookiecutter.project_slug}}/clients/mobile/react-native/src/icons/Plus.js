import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Plus = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity="0.3"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0002 25.6667C20.4435 25.6667 25.6668 20.4434 25.6668 14C25.6668 7.55672 20.4435 2.33337 14.0002 2.33337C7.55684 2.33337 2.3335 7.55672 2.3335 14C2.3335 20.4434 7.55684 25.6667 14.0002 25.6667Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.1667 8C15.1667 7.44772 14.719 7 14.1667 7H13.8333C13.281 7 12.8333 7.44772 12.8333 8V12.8333H8C7.44772 12.8333 7 13.281 7 13.8333V14.1667C7 14.719 7.44772 15.1667 8 15.1667H12.8333V20C12.8333 20.5523 13.281 21 13.8333 21H14.1667C14.719 21 15.1667 20.5523 15.1667 20V15.1667H20C20.5523 15.1667 21 14.719 21 14.1667V13.8333C21 13.281 20.5523 12.8333 20 12.8333H15.1667V8Z"
      fill={color}
    />
  </Svg>
)

export default Plus
