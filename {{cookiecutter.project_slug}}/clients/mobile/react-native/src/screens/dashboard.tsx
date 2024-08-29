import { BButton } from '@components/button'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { SHEET_NAMES } from '@components/sheets'
import { useLogout } from '@services/user'
import { navioAtom } from '@stores/navigation'
import { useAtomValue } from 'jotai'
import React from 'react'
import { Text, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import Ionicons from '@expo/vector-icons/Ionicons';
import { BounceableWind } from '@components/styled'

export const DashboardScreen = () => {
  const navio = useAtomValue(navioAtom)
  const { mutate: logout } = useLogout()

  const onOpenSheet = () => {
    SheetManager.show(SHEET_NAMES.test, {
      payload: {
        input: 'Hello from payload',
      },
    })
  }

  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1">
      <View className="flex-grow items-center justify-center">
        <View className="flex-row justify-between items-center">
          <View></View>
          <BounceableWind onPress={() => navio.stacks.push('SettingsStack')}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </BounceableWind>
        </View>
        <Text className="text-xl font-primary-bold">Welcome to the Dashboard</Text>
      </View>
      <View className="w-full p-3">
        <View className="pb-2">
          <BButton
            label="Logout"
            onPress={() => {
              logout(undefined, {
                onSettled: () => {
                  navio?.setRoot('stacks', 'AuthStack')
                },
              })
            }}
            variant="primary-transparent"
          />
        </View>
        <BButton label="Open sheet" onPress={onOpenSheet} variant="primary" />
      </View>
    </MultiPlatformSafeAreaView>
  )
}
