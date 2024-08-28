import { Text, View } from 'react-native'
import { BButton } from '@components/button'
import { Container } from '@components/container'
import { getNavio } from '..'
import { ContactEmailButton } from '@components/contact-email-button'
import { Ionicons } from '@expo/vector-icons'
import colors from '@utils/colors'
import { BounceableWind } from '@components/styled'

export const ContactUs = () => {
  const navio = getNavio()

  return (
    <Container>
      <View className="items-center">
        <BounceableWind
          onPress={() => {
            navio.goBack()
          }}
          contentContainerClassName="absolute left-0 top-0"
        >
          <Ionicons size={26} name="chevron-back" color={colors.grey[280]} />
        </BounceableWind>
        <Text className="text-xl font-primary-medium">
          Contact Us
        </Text>
      </View>
      <View className="flex-grow items-center justify-center">
        <View className="pt-10">
          <Text className="text-grey-280 text-2xl text-center font-primary-bold">
            Needing help?
          </Text>
        </View>
        <View className="pt-3 justify-center item-center">
          <Text className="text-grey-280 text-lg text-center">Reach out to us at</Text>
          <ContactEmailButton />
        </View>
      </View>
      <View>
        <BButton
          label="BACK TO SETTINGS"
          variant="primary"
          onPress={() => {
            navio.goBack()
          }}
        />
      </View>
    </Container>
  )
}
