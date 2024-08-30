import { FC, ReactNode } from 'react'
import { View } from 'react-native'
import { MultiPlatformSafeAreaView } from './multi-platform-safe-area-view'

export const Container: FC<{
  children: ReactNode
  containerClassName?: string
  innerContainerClassName?: string
  hasHorizontalPadding?: boolean
}> = ({ children, containerClassName, innerContainerClassName, hasHorizontalPadding = true }) => {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName={`h-full flex-1 flex-grow ${containerClassName}`}>
      <View
        className={`flex-1 flex-grow ${
          hasHorizontalPadding ? 'px-4' : ''
        } ${innerContainerClassName}`}
      >
        {children}
      </View>
    </MultiPlatformSafeAreaView>
  )
}
