import React from 'react'
import { Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'

import { Auth } from '@screens/auth/auth'
import { DashboardScreen } from '@screens/dashboard'
import { ComponentsPreview } from '@screens/ComponentsPreview'
import { ContactUs, EditProfile, Settings } from '@screens/settings'

// Type definitions for navigation
export type RootStackParamList = {
  AuthStack: undefined
  MainStack: undefined
  SettingsStack: undefined
  PreviewStack: undefined
}

export type AuthStackParamList = {
  Auth: undefined
  Login: undefined
  SignUp: undefined
}

export type MainStackParamList = {
  DashboardScreen: undefined
}

export type SettingsStackParamList = {
  Settings: undefined
  ContactUs: undefined
  EditProfile: undefined
}

export type PreviewStackParamList = {
  ComponentsPreview: undefined
}

// Stack navigators
const RootStack = createNativeStackNavigator<RootStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
// const MainStack = createNativeStackNavigator<MainStackParamList>()
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>()
const PreviewStack = createNativeStackNavigator<PreviewStackParamList>()

// Default options
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

// Stack components
const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={screenDefaultOptions}>
    <AuthStack.Screen name="Auth" component={Auth} />
  </AuthStack.Navigator>
)

// const MainStackScreen = () => (
//   <MainStack.Navigator screenOptions={screenDefaultOptions}>
//     <MainStack.Screen name="DashboardScreen" component={DashboardScreen} />
//   </MainStack.Navigator>
// )

const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={screenDefaultOptions}>
    <SettingsStack.Screen name="Settings" component={Settings} />
    <SettingsStack.Screen name="ContactUs" component={ContactUs} />
    <SettingsStack.Screen name="EditProfile" component={EditProfile} />
  </SettingsStack.Navigator>
)

const PreviewStackScreen = () => (
  <PreviewStack.Navigator screenOptions={screenDefaultOptions}>
    <PreviewStack.Screen name="ComponentsPreview" component={ComponentsPreview} />
  </PreviewStack.Navigator>
)

// 1. Create a Bottom Tab Navigator
const Tab = createBottomTabNavigator()

// 2. Define your tab screens
const TabNavigator = () => (
  <Tab.Navigator screenOptions={tabDefaultOptions}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Settings" component={SettingsStackScreen} />
    {/* Add more tabs as needed */}
  </Tab.Navigator>
)

// 3. Use TabNavigator in your RootNavigator or wherever you want the bottom tabs
{% raw %}
const RootNavigator = () => (
  <RootStack.Navigator initialRouteName="AuthStack" screenOptions={screenDefaultOptions}>
    <RootStack.Screen
      name="AuthStack"
      component={AuthStackScreen}
      options={{ headerShown: false }}
    />
    <RootStack.Screen name="MainStack" component={TabNavigator} options={{ headerShown: false }} />
    <RootStack.Screen
      name="SettingsStack"
      component={SettingsStackScreen}
      options={{ headerShown: false }}
    />
    <RootStack.Screen
      name="PreviewStack"
      component={PreviewStackScreen}
      options={{ headerShown: false }}
    />
  </RootStack.Navigator>
)
{% endraw %}

// App Root Component with navigation ref
export const AppRoot = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigationRef = React.useRef<any>(null)

  React.useEffect(() => {
    // Set the navigation ref for use outside components if needed
    import('@stores/navigation').then(({ setNavigationRef }) => {
      setNavigationRef(navigationRef.current)
    })
  }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  )
}

// Legacy compatibility - returns empty object to prevent crashes during migration
export const getNavio = () => ({})
