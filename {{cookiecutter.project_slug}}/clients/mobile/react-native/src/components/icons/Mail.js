import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Mail = ({ color, size, ...props }) => (
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
      d="M5 6C3.89543 6 3 6.89543 3 8V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V8C21 6.89543 20.1046 6 19 6H5ZM19.1604 8.14443C18.964 7.77972 18.5091 7.64327 18.1444 7.83965L12 11.1482L5.85557 7.83965C5.49087 7.64327 5.03603 7.77972 4.83965 8.14443C4.64327 8.50913 4.77972 8.96397 5.14443 9.16035L11.6444 12.6604C11.8664 12.7799 12.1336 12.7799 12.3556 12.6604L18.8556 9.16035C19.2203 8.96397 19.3567 8.50913 19.1604 8.14443Z"
      fill={color}
    />
  </Svg>
)

export default Mail
