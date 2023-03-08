import 'expo-dev-client'
import { setNotificationHandler } from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppRoot } from './src/screens'
import { initServices } from './src/services'
import { SSProvider } from './src/utils/providers'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './src/stores/auth'
import { initSentry } from './src/utils/sentry'

LogBox.ignoreLogs(['Require'])

initSentry()

export const client = new QueryClient()

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default (): JSX.Element => {
  const [ready, setReady] = useState(false)
  const hasHydrated = useAuth.use.hasHydrated()

  const start = useCallback(async () => {
    await SplashScreen.preventAutoHideAsync()

    await initServices()

    setReady(true)
    await SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    start()
  }, [start])

  if (!ready || !hasHydrated) return <></>
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SSProvider>
        <QueryClientProvider client={client}>
          <StatusBar />
          <AppRoot />
        </QueryClientProvider>
      </SSProvider>
    </GestureHandlerRootView>
  )
}
