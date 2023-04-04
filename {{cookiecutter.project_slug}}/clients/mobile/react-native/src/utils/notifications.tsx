import * as Device from 'expo-device'
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  AndroidImportance,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  Notification,
  removeNotificationSubscription,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications'
import { useEffect, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'

export const useListenLogNotification = () => {
  const notificationListener = useRef<ReturnType<typeof addNotificationReceivedListener>>()
  const responseListener = useRef<ReturnType<typeof addNotificationResponseReceivedListener>>()

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener((notification) => {
      Alert.alert(
        'Received notification',
        JSON.stringify(notification.request.content, undefined, 2),
      )
    })

    responseListener.current = addNotificationResponseReceivedListener((response) => {
      Alert.alert(
        'Responded notification',
        JSON.stringify(response.notification.request.content, undefined, 2),
      )
    })

    return () => {
      notificationListener.current && removeNotificationSubscription(notificationListener.current)
      responseListener.current && removeNotificationSubscription(responseListener.current)
    }
  }, [])
}

export async function registerForPushNotificationsAsync() {
  let token
  if (Device.isDevice) {
    const { status: existingStatus } = await getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.error('Failed to get push token for push notification!')
      return null
    }
    token = (await getExpoPushTokenAsync()).data
    if (Platform.OS === 'android') {
      setNotificationChannelAsync('default', {
        name: 'default',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }
  } else {
    console.error('Must use physical device for Push Notifications')
  }

  return token
}
