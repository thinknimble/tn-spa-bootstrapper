import { useNavigation as useRNNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@screens/routes'

// Type for the navigation prop
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// Custom hook that provides navigation functionality similar to RNNavio
export const useNavigation = <TParams = object>() => {
  const navigation = useRNNavigation<NavigationProp>()
  const route = useRoute()

  const navigate = (screenName: string, params?: TParams) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.navigate(screenName as any, params)
  }

  const push = (screenName: string, params?: TParams) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.push(screenName as any, params)
  }

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  const popToTop = () => {
    navigation.popToTop()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reset = (state: any) => {
    navigation.reset(state)
  }

  // Navigate to a stack (helper for main navigation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigateToStack = (stackName: keyof RootStackParamList, params?: any) => {
    navigation.navigate(stackName, params)
  }

  // Stack-specific navigation helpers
  const stacks = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    push: (stackName: keyof RootStackParamList, params?: any) => {
      navigation.navigate(stackName, params)
    },
    goToAuth: () => navigateToStack('AuthStack'),
    goToMain: () => navigateToStack('MainStack'),
    goToSettings: () => navigateToStack('SettingsStack'),
    goToPreview: () => navigateToStack('PreviewStack'),
  }

  return {
    // Core navigation methods
    navigate,
    push,
    goBack,
    popToTop,
    reset,

    // Stack navigation
    navigateToStack,
    stacks,

    // Route info
    currentRoute: route.name,
    routeParams: route.params,

    // Original React Navigation methods (for advanced usage)
    navigation,
    route,
  }
}

// Hook for accessing navigation state
export const useNavigationState = () => {
  const navigation = useRNNavigation()

  return {
    canGoBack: navigation.canGoBack(),
    currentState: navigation.getState(),
  }
}
