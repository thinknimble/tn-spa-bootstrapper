import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import logo from '../../assets/tn-logo.png'

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
  return (
    <View className="flex-grow items-center justify-center">
      <View className="items-center justify-center">
        <Image source={logo} style={styles.logo} />
      </View>
      <View className="items-center pt-4">
        <Text className="text-center text-xl font-variant-italic-bold">Welcome to my project</Text>
      </View>
    </View>
  )
}
