import logo from '@assets/logo-sq.png'
import { Image, View } from 'react-native'
import { MultiPlatformSafeAreaView } from './multi-platform-safe-area-view'

export const LoadingScreen = () => {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow justify-center items-center">
      <View className="flex-1 justify-center items-center">
        <View className="w-full justify-center items-center">
          <Image source={logo} className="w-full" resizeMode="contain" />
        </View>
      </View>
    </MultiPlatformSafeAreaView>
  )
}
