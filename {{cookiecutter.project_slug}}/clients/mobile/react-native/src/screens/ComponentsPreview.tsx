import React from 'react'
import { Text, View } from 'react-native'

import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BButton } from '@components/button'

export function ComponentsPreview() {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow">
      <View>
        <Text className="text-black">Components Preview </Text>
      </View>
      <View className="p-2">
        <BButton label="Primary Button" variant="primary" />
        <BButton label="Primary Transparent Button" variant="primary-transparent" />
        <BButton label="Secondary Button" variant="secondary" />
        <BButton label="Loading State" variant="primary" isLoading={true} />
      </View>
    </MultiPlatformSafeAreaView>
  )
}
