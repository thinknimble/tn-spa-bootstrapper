import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Copy = ({ color, size, ...props }) => (
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
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.8182 4H6.18182C4.76751 4 4 4.76751 4 6.18182V13.8182C4 15.1706 4.70185 15.9316 6 15.9956V9C6 7.34315 7.34315 6 9 6H15.9956C15.9316 4.70185 15.1706 4 13.8182 4Z"
      fill={color}
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10.1818 8H17.8182C19.2325 8 20 8.76751 20 10.1818V17.8182C20 19.2325 19.2325 20 17.8182 20H10.1818C8.76751 20 8 19.2325 8 17.8182V10.1818C8 8.76751 8.76751 8 10.1818 8Z"
      fill={color}
    />
  </Svg>
)

export default Copy
