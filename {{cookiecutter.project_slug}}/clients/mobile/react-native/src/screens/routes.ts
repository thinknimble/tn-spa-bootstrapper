import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { Auth } from '@screens/auth/auth'
import { ComponentsPreview } from '@screens/ComponentsPreview'
import { DashboardScreen } from '@screens/dashboard'
import { Main } from '@screens/main'
import { ContactUs, EditProfile, Settings } from '@screens/settings'
import { Platform } from 'react-native'
import { Navio } from 'rn-navio'
import { Login, SignUp } from './auth'
import { ChatScreen } from './chat'

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
  screens: {
    Auth,
    Login,
    SignUp,
    Main,
    DashboardScreen,
    ComponentsPreview,
    Settings,
    ContactUs,
    EditProfile,
    ChatScreen,
  },
  stacks: {
    AuthStack: ['Auth'],
    MainStack: ['DashboardScreen', 'ChatScreen'],
    SettingsStack: ['Settings', 'ContactUs', 'EditProfile'],
    /**
     * Set me as the root to see the components preview
     */
    PreviewStack: ['ComponentsPreview'],
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
export type AppScreens = Parameters<(typeof navio)['push']>[0]
export type AppStacks = Parameters<(typeof navio)['stacks']['push']>[0]
