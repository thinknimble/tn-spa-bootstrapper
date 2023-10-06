import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { Fragment } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { Main } from '@screens/main'
import { Login } from '@screens/auth/login'
import { SignUp } from '@screens/auth/sign-up'
import { Bounceable } from 'rn-bounceable'

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

export const Auth = () => {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow">
      <NavigationContainer independent>
        <Tab.Navigator tabBar={TopTab} sceneContainerStyle={styles.paddingH20}>
          {tabs.map((t, idx) => (
            <Tab.Screen name={t.name} component={t.component} key={idx} />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
    </MultiPlatformSafeAreaView>
  )
}
