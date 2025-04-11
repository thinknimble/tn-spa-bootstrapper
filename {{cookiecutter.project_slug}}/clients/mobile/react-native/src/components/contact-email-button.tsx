import { Linking, Text } from 'react-native'
import { Bounceable } from 'rn-bounceable'
import { useConstants } from '@utils/constants'

export const ContactEmailButton = () => {
  const { supportEmail } = useConstants()
  const handleSendMail = async () => {
    const mailtoUrl = `mailto:${supportEmail}`
    const canOpen = await Linking.canOpenURL(mailtoUrl)
    if (canOpen) {
      Linking.openURL(mailtoUrl)
    } else {
      console.error('could not open this url: ', mailtoUrl)
    }
  }
  return (
    <Bounceable onPress={handleSendMail}>
      <Text className="text-lg text-center font-primary-bold">{supportEmail}</Text>
    </Bounceable>
  )
}
