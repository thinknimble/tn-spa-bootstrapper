import { BButton } from '@components/Button'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { SHEET_NAMES } from '@components/sheets'
import { useLogout } from '@services/user'
import { useNavigation } from '@hooks/useNavigation'
import React from 'react'
import { Text, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { BounceableWind } from '@components/styled'

export const DashboardScreen = () => {
  const { stacks } = useNavigation()
  const { mutate: logout } = useLogout()

  const onOpenSheet = () => {
    SheetManager.show(SHEET_NAMES.test, {
      payload: {
        input: 'Hello from payload',
      },
    })
  }

  const onGoToChat = () => {
    navio?.push('ChatScreen')
  }

  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1">
      <View className="flex-grow items-center">
        <View className="flex-row justify-end items-center w-full px-10">
          <BounceableWind
            contentContainerClassName="flex-row items-center gap-2"
            onPress={() => stacks.push('SettingsStack')}
          >
            <Text>Settings</Text>
            <Ionicons name="settings-outline" size={32} color="black" />
          </BounceableWind>
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-xl font-primary-bold">Welcome to the Dashboard</Text>
        </View>
      </View>
      <View className="w-full p-3">
        <View className="pb-2">
          <BButton
            label="Logout"
            onPress={() => {
              logout(undefined, {
                onSettled: () => {
                  stacks.goToAuth()
                },
              })
            }}
            variant="primary-transparent"
          />
        </View>
        <BButton label="Open sheet" onPress={onOpenSheet} variant="primary" />
        <BButton label="Chat Demo" onPress={onGoToChat} variant="primary" />
      </View>
    </MultiPlatformSafeAreaView>
  )
}
