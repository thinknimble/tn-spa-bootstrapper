import React from 'react'
import Svg, { Path } from 'react-native-svg'

const Calendar = ({ color, size, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M3.76477 10.3087H21.5769"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M17.1057 14.2119H17.115"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M12.6713 14.2119H12.6805"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M8.22749 14.2119H8.23675"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M17.1057 18.0958H17.115"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M12.6713 18.0958H12.6805"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M8.22749 18.0958H8.23675"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M16.7074 2.90934V6.19794"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M8.63446 2.90934V6.19794"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.9018 4.48749H8.44011C5.50536 4.48749 3.6723 6.12234 3.6723 9.12744V18.1711C3.6723 21.2235 5.50536 22.8961 8.44011 22.8961H16.8925C19.8366 22.8961 21.6604 21.2518 21.6604 18.2467V9.12744C21.6696 6.12234 19.8458 4.48749 16.9018 4.48749Z"
      stroke={color}
      stroke-width="1.49901"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
)

export default Calendar
