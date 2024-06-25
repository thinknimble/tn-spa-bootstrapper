import { Platform } from 'react-native'
import { Navio } from 'rn-navio'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { Login, SignUp } from '@screens/auth'
import { Main } from '@screens/main'
import { Auth } from '@screens/auth/auth'
import { DashboardScreen } from '@screens/dashboard'

// Default options - forcing a mobile trigger
export const screenDefaultOptions = (): NativeStackNavigationOptions => ({
  headerShadowVisible: false,
  headerShown: false,

  // this setup makes large title work on iOS
  ...Platform.select({
    ios: {
      headerLargeTitle: true,
      headerTransparent: true,
      headerBlurEffect: 'regular',
    },
  }),
})

export const tabDefaultOptions = (): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarStyle: { borderTopWidth: 0, elevation: 0 },
})
// NAVIO
export const navio = Navio.build({
  screens: { Auth, Login, SignUp, Main, DashboardScreen },
  stacks: {
    AuthStack: ['Auth'],
    MainStack: ['DashboardScreen'],
  },
  root: 'AuthStack',
  defaultOptions: {
    stacks: { screen: screenDefaultOptions },
    tabs: { screen: tabDefaultOptions },
  },
})

export const getNavio = () => navio
export const AppRoot = navio.App

export type MyNavio = typeof navio
export type AppScreens = Parameters<typeof navio['push']>[0]
export type AppStacks = Parameters<typeof navio['stacks']['push']>[0]
