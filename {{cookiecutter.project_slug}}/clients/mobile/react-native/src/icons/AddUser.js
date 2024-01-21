import React from 'react'
import Svg, { Path } from 'react-native-svg'

const AddUser = ({ color, size, ...props }) => (
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
      d="M9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7C13 9.20914 11.2091 11 9 11ZM19 11C18.4477 11 18 10.5523 18 10V8H16C15.4477 8 15 7.55228 15 7C15 6.44772 15.4477 6 16 6H18V4C18 3.44772 18.4477 3 19 3C19.5523 3 20 3.44772 20 4V6H22C22.5523 6 23 6.44772 23 7C23 7.55228 22.5523 8 22 8H20V10C20 10.5523 19.5523 11 19 11Z"
      fill={color}
    />
    <Path
      d="M0.000651684 20.1992C0.388259 15.4265 4.26191 13 8.98334 13C13.7712 13 17.7049 15.2932 17.9979 20.2C18.0096 20.3955 17.9979 21 17.2467 21C13.5411 21 8.03472 21 0.727502 21C0.476712 21 -0.0204618 20.4592 0.000651684 20.1992Z"
      fill={color}
    />
  </Svg>
)

export default AddUser
