import { Text } from 'react-native'
import { MultiPlatformSafeAreaView } from '../../components/multi-platform-safe-area-view'

export const SignUp = () => {
  //TODO: match bootstrapper style for signup and hit backend
  return (
    <MultiPlatformSafeAreaView>
      <Text className="text-black text-3xl">Sign up</Text>
    </MultiPlatformSafeAreaView>
  )
}
