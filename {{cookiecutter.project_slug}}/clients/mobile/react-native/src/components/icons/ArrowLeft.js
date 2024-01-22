import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const ArrowLeft = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      opacity="0.3"
      width="2"
      height="14"
      rx="1"
      transform="matrix(0 -1 -1 0 19 13)"
      fill={color}
    />
    <Path
      d="M12.7071 17.2929C13.0976 17.6834 13.0976 18.3166 12.7071 18.7071C12.3166 19.0976 11.6834 19.0976 11.2929 18.7071L5.29289 12.7071C4.91432 12.3285 4.90107 11.7189 5.26285 11.3243L10.7628 5.32428C11.136 4.91716 11.7686 4.88965 12.1757 5.26285C12.5828 5.63604 12.6103 6.26861 12.2372 6.67572L7.38414 11.9699L12.7071 17.2929Z"
      fill={color}
    />
  </Svg>
)

export default ArrowLeft
