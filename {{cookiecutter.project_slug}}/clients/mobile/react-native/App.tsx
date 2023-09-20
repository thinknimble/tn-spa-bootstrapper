import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'expo-dev-client'
import { loadAsync } from 'expo-font'
import { setNotificationHandler } from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { LogBox, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppRoot } from '@screens/index'
import { initServices } from '@services/index'
import { useAuth } from '@stores/auth'
import { customFonts } from '@utils/fonts'
import { SSProvider } from '@utils/providers'
import { queryClient } from '@utils/query-client'
import { initSentry } from '@utils/sentry'

LogBox.ignoreLogs(['Require'])

initSentry()

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

SplashScreen.preventAutoHideAsync()

export default (): JSX.Element => {
  const [ready, setReady] = useState(false)
  const hasLocalStorageHydratedState = useAuth.use.hasHydrated()

  const start = useCallback(async () => {
    await loadAsync(customFonts)
    await initServices()
    await hasLocalStorageHydratedState
    await SplashScreen.hideAsync()
    flushSync(() => {
      setReady(true)
    })
  }, [])

  useEffect(() => {
    start()
  }, [start])

  if (!ready) return <></>
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SSProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar />
          <AppRoot />
        </QueryClientProvider>
      </SSProvider>
    </GestureHandlerRootView>
  )
}
