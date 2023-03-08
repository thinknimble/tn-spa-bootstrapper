import { Text } from 'react-native'
import { MultiPlatformSafeAreaView } from '../../components/multi-platform-safe-area-view'

export const Login = () => {
  //TODO: match bootstrapper style for login and hit backend
  return (
    <MultiPlatformSafeAreaView>
      <Text className="text-black text-3xl">Login</Text>
    </MultiPlatformSafeAreaView>
  )
}
