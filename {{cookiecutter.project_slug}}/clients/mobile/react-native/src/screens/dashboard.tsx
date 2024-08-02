import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { View } from 'react-native'
import { Text } from '@components/text'
import { SheetManager } from 'react-native-actions-sheet'
import { SHEET_NAMES } from '@components/sheets'
import { BButton } from '@components/Button'
import React from 'react'
export const DashboardScreen = () => {

  const onOpenSheet = () => {
    SheetManager.show(SHEET_NAMES.test, {
      payload: {
        input: 'Hello from payload',
      },
    })
  }

  return (
    <MultiPlatformSafeAreaView>
          <Text>Welcome to the Dashboard</Text>
          <View className="w-full pb-3 ">
          <BButton
            label="Open sheet"
            onPress={onOpenSheet}
            variant="primary"
          />
        </View>
    </MultiPlatformSafeAreaView>
  )
}
