/// <reference types="nativewind/types" />

import { ScrollViewProps } from 'react-native'
import { BounceableProps } from 'rn-bounceable'
import { CustomActionSheetProps } from '@components/sheets/custom-action-sheet'
import { SheetDefinition } from 'react-native-actions-sheet'
declare global {
  // Extend the existing BounceableProps type
  export interface ExtendedBounceableProps extends BounceableProps {
    contentContainerClassName?: string
  }
  export interface ExtendedScrollViewProps extends ScrollViewProps {
    contentContainerClassName?: string
  }

  export interface ExtendedActionSheetProps extends CustomActionSheetProps {
    containerClassName?: string
    indicatorClassName?: string
  }
}

declare module 'react-native-actions-sheet' {
  interface Sheets {
    Sample: SheetDefinition<{
      payload: {
        input: string
      }
    }>
  }
}
  
