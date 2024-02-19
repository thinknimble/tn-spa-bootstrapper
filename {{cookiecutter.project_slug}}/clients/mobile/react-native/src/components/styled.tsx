import { styled } from 'nativewind'
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { Bounceable } from 'rn-bounceable'

export const ScrollViewWind = styled(ScrollView, {
  props: {
    contentContainerStyle: true,
  },
})

export const BounceableWind = styled(Bounceable, {
  props: {
    contentContainerStyle: true,
  },
})

export const KeyboardAvoidingViewWind = styled(KeyboardAvoidingView, {
  props: {
    style: true,
    contentContainerStyle: true,
  },
})
