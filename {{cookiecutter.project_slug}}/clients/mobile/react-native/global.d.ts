/// <reference types="nativewind/types" />


import { BounceableProps } from 'rn-bounceable'
declare global {
  // Extend the existing BounceableProps type
  export interface ExtendedBounceableProps extends BounceableProps {
    contentContainerClassName?: string
  }
}