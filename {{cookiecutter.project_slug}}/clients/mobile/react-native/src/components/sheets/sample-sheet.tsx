import { useRef } from 'react'
import { View } from 'react-native'
import { ActionSheetRef, SheetProps } from 'react-native-actions-sheet'
import { Text } from '../text'
import { CustomActionSheet } from './custom-action-sheet'

export const Sample = (props: SheetProps<'Sample'>) => {
  const actionSheetRef = useRef<ActionSheetRef>(null)

  return (
    <CustomActionSheet sheetId={props.sheetId} actionSheetRef={actionSheetRef}>
      <View className="mx-5 mt-10">
        <Text textClassName="text-3xl text-center">Coming soon</Text>
        <Text textClassName="text-lg text-center">{props.payload?.input}</Text>
      </View>
    </CustomActionSheet>
  )
}
