import 'expo-dev-client'
import { setNotificationHandler } from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import { LogBox, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppRoot } from './src/screens'
import { initServices } from './src/services'
import { SSProvider } from './src/utils/providers'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './src/stores/auth'
import { initSentry } from './src/utils/sentry'
import { flushSync } from 'react-dom'

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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})

export default (): JSX.Element => {
  const [ready, setReady] = useState(false)
  const hasLocalStorageHydratedState = useAuth.use.hasHydrated()

  const start = useCallback(async () => {
    await SplashScreen.preventAutoHideAsync()

    await initServices()
    await hasLocalStorageHydratedState
    await SplashScreen.hideAsync()
    console.log('splash hidden')
    flushSync(() => {
      setReady(true)
    })
  }, [])

  useEffect(() => {
    start()
  }, [start])

  //TODO: to avoid a screen flash, return here your loading screen or something similar to your splash screen
  if (!ready) return <></>
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SSProvider>
        <QueryClientProvider client={client}>
          <StatusBar />
          <AppRoot />
        </QueryClientProvider>
      </SSProvider>
    </GestureHandlerRootView>
  )
}
