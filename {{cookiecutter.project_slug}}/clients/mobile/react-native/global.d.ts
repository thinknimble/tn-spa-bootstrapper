/// <reference types="nativewind/types" />

import { ScrollViewProps } from 'react-native'
import { BounceableProps } from 'rn-bounceable'
declare global {
  // Extend the existing BounceableProps type
  export interface ExtendedBounceableProps extends BounceableProps {
    contentContainerClassName?: string
  }
  export interface ExtendedScrollViewProps extends ScrollViewProps {
    contentContainerClassName?: string
  }
}