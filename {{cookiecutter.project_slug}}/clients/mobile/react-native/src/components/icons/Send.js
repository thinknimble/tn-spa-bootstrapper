import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Send = ({ color, size, ...props }) => (
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
      d="M3 3.77328C3 3.41045 3.37431 3.16842 3.70518 3.31732L21.9868 11.544C22.3798 11.7209 22.3798 12.2791 21.9868 12.4559L3.70518 20.6827C3.37431 20.8315 3 20.5895 3 20.2267V13.5L19 12L3 10.5V3.77328Z"
      fill={color}
    />
  </Svg>
)

export default Send
