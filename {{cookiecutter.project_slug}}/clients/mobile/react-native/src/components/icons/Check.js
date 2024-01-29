import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Check = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17.738 6.35234C18.0957 5.93153 18.7268 5.88036 19.1476 6.23804C19.5684 6.59573 19.6196 7.22682 19.2619 7.64763L10.7619 17.6476C10.3986 18.075 9.75488 18.1201 9.33562 17.7474L4.83562 13.7474C4.42283 13.3805 4.38565 12.7484 4.75257 12.3356C5.11949 11.9228 5.75156 11.8857 6.16434 12.2526L9.90019 15.5733L17.738 6.35234Z"
      fill={color}
    />
  </Svg>
)

export default Check