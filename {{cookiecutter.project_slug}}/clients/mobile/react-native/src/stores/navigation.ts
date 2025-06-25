import { NavigationContainerRef } from '@react-navigation/native'
import { RootStackParamList } from '@screens/routes'

// Navigation reference for accessing navigation outside of React components
// This is only needed if you want to navigate from services, utilities, or other non-component code
export let navigationRef: NavigationContainerRef<RootStackParamList> | null = null

export const setNavigationRef = (ref: NavigationContainerRef<RootStackParamList> | null) => {
  navigationRef = ref
}

// Utility functions for navigation outside of components
export const navigate = (name: keyof RootStackParamList, params?: any) => {
  if (navigationRef?.isReady()) {
    navigationRef.navigate(name as any, params)
  }
}

export const goBack = () => {
  if (navigationRef?.isReady() && navigationRef?.canGoBack()) {
    navigationRef.goBack()
  }
}

export const reset = (state: any) => {
  if (navigationRef?.isReady()) {
    navigationRef.reset(state)
  }
}

// Stack navigation helpers for use outside components
export const goToAuth = () => navigate('AuthStack')
export const goToMain = () => navigate('MainStack')
export const goToSettings = () => navigate('SettingsStack')
export const goToPreview = () => navigate('PreviewStack')
