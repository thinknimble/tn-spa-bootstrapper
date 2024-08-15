import { Dimensions, Image, StyleSheet, View } from 'react-native'
import logo from '@assets/tn-logo.png'
import { Text } from '@components/text'
import { BButton } from '@components/Button'
import { SheetManager } from 'react-native-actions-sheet'
import { SHEET_NAMES } from '@components/sheets'

const { height } = Dimensions.get('screen')

const ratio = 4.5
const imageBaseHeight = height / ratio

const styles = StyleSheet.create({
  logo: {
    width: 'auto',
    height: imageBaseHeight,
    aspectRatio: 585 / 584,
  },
})

export const Main = () => {
  const onOpenSheet = () => {
    SheetManager.show(SHEET_NAMES.test, {
      payload: {
        input: 'Hello from payload',
      },
    })
  }

  return (
    <View className="flex-grow items-center justify-center">
      <View className="items-center justify-center">
        <Image source={logo} style={styles.logo} />
      </View>
      <View className="items-center pt-4">
        <Text textClassName="text-center text-xl" variant="italic-bold">
          Welcome to my project
        </Text>
      </View>
      <BButton label="Open sheet" onPress={onOpenSheet} variant="primary" />
    </View>
  )
}
