import '@components/sheets/register-sheets'
import { AppRoot } from '@screens/routes'
import * as Sentry from '@sentry/react-native'
import { useAuth } from '@stores/auth'
import { QueryClientProvider } from '@tanstack/react-query'
import { customFonts } from '@utils/fonts'
import { queryClient } from '@utils/query-client'
import { initSentry } from '@utils/sentry'
import 'expo-dev-client'
import { setNotificationHandler } from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

import React, { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { LogBox, StyleSheet } from 'react-native'
import { SheetProvider } from 'react-native-actions-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
import './global.css'

LogBox.ignoreLogs(['Require'])

initSentry()

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldSetBadge: false,
  }),
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})

SplashScreen.preventAutoHideAsync()

export default Sentry.wrap((): React.JSX.Element => {
  const [ready, setReady] = useState(false)
  const hasLocalStorageHydratedState = useAuth.use.hasHydrated()
  const token = useAuth.use.token()
  const [loaded, error] = useFonts(customFonts)

  const start = useCallback(async () => {
    await hasLocalStorageHydratedState
    await SplashScreen.hideAsync()

    flushSync(() => {
      setReady(true)
    })
  }, [hasLocalStorageHydratedState])

  useEffect(() => {
    if (!loaded) return
    start()
  }, [loaded, start])

  if (!ready) return <></>
  return (
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <SheetProvider>
          <StatusBar style="dark" />
          <AppRoot />
        </SheetProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
})
