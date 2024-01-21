import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Delta = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.86469 8.432L19.6884 2.49077C20.1075 2.35106 20.5606 2.57758 20.7003 2.99674C20.755 3.16095 20.755 3.33849 20.7003 3.5027L14.7591 21.3264C14.6193 21.7455 14.1663 21.9721 13.7471 21.8323C13.5419 21.7639 13.3732 21.6153 13.2793 21.4204L9.53899 13.6521L1.77062 9.91174C1.37254 9.72007 1.2052 9.24198 1.39687 8.84389C1.49071 8.64899 1.65948 8.5004 1.86469 8.432Z"
      fill={color}
    />
  </Svg>
)

export default Delta
