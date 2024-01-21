import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

const ArrowRight = ({ color, size, ...props }) => (
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
      x="5"
      y="13"
      width="2"
      height="14"
      rx="1"
      transform="rotate(-90 5 13)"
      fill={color}
    />
    <Path
      d="M11.2929 17.2929C10.9024 17.6834 10.9024 18.3166 11.2929 18.7071C11.6834 19.0976 12.3166 19.0976 12.7071 18.7071L18.7071 12.7071C19.0857 12.3285 19.0989 11.7189 18.7372 11.3243L13.2372 5.32428C12.864 4.91716 12.2314 4.88965 11.8243 5.26285C11.4172 5.63604 11.3897 6.26861 11.7628 6.67572L16.6159 11.9699L11.2929 17.2929Z"
      fill={color}
    />
  </Svg>
)

export default ArrowRight
