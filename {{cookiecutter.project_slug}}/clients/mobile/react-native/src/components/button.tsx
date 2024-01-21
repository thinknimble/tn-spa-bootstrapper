import { FontWeightStyle } from '@utils/fonts'
import { styled } from 'nativewind'
import { FC, ReactNode, useMemo } from 'react'
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native'
import { Bounceable, BounceableProps } from 'rn-bounceable'
import { Text } from './text'
import { colors } from '../../tailwind-colors'
import { openBrowserAsync } from 'expo-web-browser'

export type BButtonVariant =
  | 'accent'
  | 'link'
  | 'link-discreet'
  | 'secondary'
  | 'secondary-transparent'
  | 'accent-white'
  | 'accent-dark'
  | 'secondary-transparent-dark'
  | 'cancel'
  | 'reverse-accent'
  | 'dark-link'
  | 'link-accent'
  | 'link-discreet-accent'
  | 'secondary-borderless'
  | 'none'

type Props = {
  label?: string | ReactNode
  onPress?: PureFunc
  variant?: BButtonVariant
  buttonProps?: BounceableProps
  /**
   * Override the default style of the button
   */
  buttonContainerStyle?: StyleProp<ViewStyle>
  className?: string
  containerClassName?: string
  isLoading?: boolean
}

const mapButtonVariantToStyle: Record<
  BButtonVariant,
  { background: string; text: string; textVariant?: FontWeightStyle; spinnerColor?: string }
> = {
  accent: {
    background: 'bg-secondary-500',
    text: 'text-white',
  },
  'accent-white': {
    background: 'bg-white',
    text: 'text-primary-500',
  },
  'accent-dark': {
    background: 'bg-primary-500',
    text: 'text-white',
  },
  link: {
    background: '',
    text: 'text-sm underline text-primary-300',
    textVariant: 'light',
  },
  'link-discreet': {
    background: '',
    text: 'text-sm text-primary-300',
  },
  secondary: {
    background: 'bg-white border border-secondary-500',
    text: 'text-secondary-500',
  },
  'secondary-transparent': {
    background: 'bg-transparent border border-white',
    text: 'text-white',
  },
  'secondary-transparent-dark': {
    background: 'bg-transparent border border-primary-500',
    text: 'text-primary-500',
  },
  'secondary-borderless': {
    background: '',
    text: 'text-secondary-400',
    textVariant: 'light',
  },
  cancel: {
    background: 'bg-transparent border border-secondary-400',
    text: 'text-secondary-400',
    spinnerColor: colors.secondary[400],
  },
  'reverse-accent': {
    background: 'bg-white',
    text: 'text-secondary-500',
  },
  'dark-link': {
    background: 'text-white rounded-3xl border-white border',
    text: 'text-white',
  },
  'link-accent': {
    background: 'text-white rounded-3xl',
    text: 'text-secondary underline',
  },
  'link-discreet-accent': {
    background: '',
    text: 'text-secondary',
  },
  none: {
    background: '',
    text: '',
  },
}

const BButtonRaw: FC<Props> = ({
  label,
  onPress,
  buttonProps,
  variant = 'accent',
  buttonContainerStyle = undefined,
  isLoading = false,
  ...props
}) => {
  const variantStyle = useMemo(() => {
    return mapButtonVariantToStyle[variant]
  }, [variant])

  return (
    <View
      {...props}
      // these two stop the propagation of the event in case there are more pressables upriver
      onStartShouldSetResponder={() => true}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <Bounceable {...buttonProps} onPress={onPress} disabled={buttonProps?.disabled || isLoading}>
        <View
          className={`items-center justify-center rounded-full ${
            !buttonContainerStyle ? 'p-4' : ''
          } ${variantStyle.background} ${buttonProps?.disabled ? 'opacity-50' : ''}`}
          style={[buttonContainerStyle ?? {}]}
        >
          {isLoading ? (
            <ActivityIndicator color={variantStyle?.spinnerColor || 'white'} />
          ) : typeof label === 'string' ? (
            <Text textClassName={variantStyle.text} variant={variantStyle.textVariant ?? 'bold'}>
              {label}
            </Text>
          ) : (
            <>{label}</>
          )}
        </View>
      </Bounceable>
    </View>
  )
}
export const BButton = styled(BButtonRaw, {
  props: {
    buttonContainerStyle: true,
  },
})

export const HeaderButton: FC<Props> = ({ label, onPress, ...modifiers }) => {
  return (
    <View {...modifiers}>
      <Bounceable onPress={onPress}>
        <View className="justify-center items-center p-1 my-1">
          <Text textClassName="text-base">{label}</Text>
        </View>
      </Bounceable>
    </View>
  )
}

type LinkVariants = 'link' | 'link-discreet' | 'dark-link' | 'link-accent' | 'none'

export const LinkButton: FC<{ label: string; url: string; variant?: LinkVariants }> = ({
  label,
  url,
  variant = 'link',
}) => {
  const variantStyle = mapButtonVariantToStyle[variant]
  return (
    <Bounceable
      onPress={() => {
        openBrowserAsync(url)
      }}
    >
      <View>
        <Text textClassName={variantStyle.text} variant={variantStyle.textVariant ?? 'bold'}>
          {label}
        </Text>
      </View>
    </Bounceable>
  )
}
