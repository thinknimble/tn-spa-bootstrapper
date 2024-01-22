import React from 'react'
import Svg, { Rect } from 'react-native-svg'

const Communication = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect id="Rectangle 7" opacity="0.3" x="4" y="4" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 3" x="4" y="10" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy" x="10" y="4" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 4" x="10" y="10" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 2" x="16" y="4" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 5" x="16" y="10" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 8" x="4" y="16" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 7" x="10" y="16" width="4" height="4" rx="2" fill={color} />
    <Rect id="Rectangle 7 Copy 6" x="16" y="16" width="4" height="4" rx="2" fill={color} />
  </Svg>
)

export default Communication
