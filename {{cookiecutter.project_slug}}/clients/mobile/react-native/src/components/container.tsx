import { FC, ReactNode } from 'react'
import { View } from 'react-native'
import { MultiPlatformSafeAreaView } from './multi-platform-safe-area-view'
import { cn } from '@utils/style'

export const Container: FC<{
  children: ReactNode
  containerClassName?: string
  innerContainerClassName?: string
  hasHorizontalPadding?: boolean
}> = ({ children, containerClassName, innerContainerClassName, hasHorizontalPadding = true }) => {
  return (
    <MultiPlatformSafeAreaView
      safeAreaClassName={cn(['h-full flex-1 flex-grow', containerClassName])}
    >
      <View
        className={cn([
          'flex-1 flex-grow',
          hasHorizontalPadding ? 'px-4' : '',
          innerContainerClassName,
        ])}
      >
        {children}
      </View>
    </MultiPlatformSafeAreaView>
  )
}
