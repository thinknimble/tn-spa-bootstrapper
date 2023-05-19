import { Platform } from 'react-native'
import { Navio } from 'rn-navio'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { Login, SignUp } from './auth'
import { Main } from './main'
import { Auth } from './auth/auth'

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
  screens: { Auth, Login, SignUp, Main },
  stacks: {
    AuthStack: ['Auth'],
    MainStack: ['Main'],
  },
  root: 'AuthStack',
  defaultOptions: {
    stacks: { screen: screenDefaultOptions },
    tabs: { screen: tabDefaultOptions },
  },
})

export const getNavio = () => navio
export const AppRoot = navio.App

export type AppScreens = Parameters<typeof navio['push']>[0]
export type AppStacks = Parameters<typeof navio['stacks']['push']>[0]
