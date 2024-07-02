import React, { useMemo } from 'react'
import {
  View,
} from 'react-native'

import { Text } from '@components/text'
import colors from '@utils/colors'
import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BButton } from '@components/Button'


export function ComponentsPreview(){
    return (
        <MultiPlatformSafeAreaView safeAreaClassName="flex-1 flex-grow">

        <View>
            <Text textClassName='text-black'>Components Preview </Text>
        </View>
        <View className="p-2" >
            <BButton label='Primary Button' variant='primary' />
            <BButton label='Primary Transparent Button' variant='primary-transparent' />
            <BButton label='Secondary Button' variant='secondary' />
            <BButton label='Loading State' variant='primary' isLoading={true} />


        </View>
        </MultiPlatformSafeAreaView>
    )
}