import { FC, useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { MultiPlatformSafeAreaView } from './multi-platform-safe-area-view'

export const LoadingScreen = () => {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow justify-center items-center">
      <View className="flex-1 justify-center items-center">
        <View className="w-full justify-center items-center">
          <View className="pt-3">
            <ActivityIndicator color="#F68F58" size={'large'} />
          </View>
        </View>
      </View>
    </MultiPlatformSafeAreaView>
  )
}

//TODO: I would like to investigate further if we can avoid this component. And instead just render the right screen directly
export const LoadingRedirect: FC<{ onRedirect: () => void }> = ({ onRedirect }) => {
  useEffect(() => {
    setTimeout(() => {
      onRedirect()
    }, 0)
  }, [onRedirect])

  return <LoadingScreen />
}
