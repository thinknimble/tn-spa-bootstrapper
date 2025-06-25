import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { FC, Fragment, ReactNode, useCallback, useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { Main } from '@screens/main'
import { Login } from '@screens/auth/login'
import { SignUp } from '@screens/auth/sign-up'
import { Bounceable } from 'rn-bounceable'
import { useUser } from '@services/user'
import { useAuth } from '@stores/auth'
import { HttpStatusCode, isAxiosError } from 'axios'
import { useNavigation } from '@hooks/useNavigation'
import { LoadingRedirect, LoadingScreen } from '@components/loading'

const Tab = createMaterialTopTabNavigator()

const tabs = [
  { name: 'home', label: 'Home', component: Main },
  { name: 'login', label: 'Login', component: Login },
  { name: 'signup', label: 'Signup', component: SignUp },
]

const TopTab = ({ navigation, state }: MaterialTopTabBarProps) => {
  return (
    <View className="flex-row justify-around px-3 py-4">
      {tabs.map((t, idx) => {
        const isCurrent = state.index === idx
        return (
          <Fragment key={idx}>
            <Bounceable
              onPress={() => {
                navigation.navigate(t.name)
              }}
            >
              <View>
                <Text className={`text-xl ${isCurrent ? 'text-primary' : ''}`}>{t.label}</Text>
              </View>
            </Bounceable>
            {idx !== tabs.length - 1 ? (
              <View className="items-center justify-center">
                <Text>|</Text>
              </View>
            ) : null}
          </Fragment>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  paddingH20: {
    paddingHorizontal: 20,
  },
})

const useUnauthUserOnError = () => {
  const { userQuery: query } = useUser()
  const { clearAuth } = useAuth.use.actions()

  const { stacks } = useNavigation()

  useEffect(() => {
    if (query.error) {
      if (
        isAxiosError(query.error) &&
        (query.error.response?.status === HttpStatusCode.Unauthorized ||
          query.error.response?.status === HttpStatusCode.NotFound)
      ) {
        clearAuth()
        stacks.goToAuth()
      }
    }
  })
}

export const AuthUX: FC<{ children: ReactNode }> = ({ children }) => {
  const isAuth = useAuth((s) => Boolean(s.token))
  const user = useAuth.use.user()
  useUnauthUserOnError()
  const { stacks } = useNavigation()

  const onAuthRedirect = useCallback(() => {
    // if the user is logged in, redirect to dashboard
    if (user) {
      stacks.goToMain()
    }
  }, [user, stacks])

  if (!isAuth) {
    return <>{children}</>
  }
  if (!user) {
    return <LoadingScreen />
  }

  return <LoadingRedirect onRedirect={onAuthRedirect} />
}

export const Auth = () => {
  return (
    <AuthUX>
      <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow">
        <NavigationContainer independent>
          <Tab.Navigator tabBar={TopTab} sceneContainerStyle={styles.paddingH20}>
            {tabs.map((t, idx) => (
              <Tab.Screen name={t.name} component={t.component} key={idx} />
            ))}
          </Tab.Navigator>
        </NavigationContainer>
      </MultiPlatformSafeAreaView>
    </AuthUX>
  )
}
