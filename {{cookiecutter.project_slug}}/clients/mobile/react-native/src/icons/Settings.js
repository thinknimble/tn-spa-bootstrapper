import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Settings = ({ color, size, ...props }) => (
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
      d="M1.68628 12L4.99999 8.68625V4.99996H8.68628L11.5858 2.10046L14.4853 4.99996H19V9.51468L21.4853 12L19 14.4852V19H14.4853L11.5858 21.8995L8.68628 19H4.99999V15.3137L1.68628 12ZM15 12C15 13.6568 13.6568 15 12 15C10.3431 15 8.99999 13.6568 8.99999 12C8.99999 10.3431 10.3431 8.99996 12 8.99996C13.6568 8.99996 15 10.3431 15 12Z"
      fill={color}
    />
  </Svg>
)

export default Settings
