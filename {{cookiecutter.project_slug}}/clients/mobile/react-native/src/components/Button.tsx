import colors from '@utils/colors'
import { cn } from '@utils/style'
import React, { useMemo } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  Text,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native'
import { BounceableProps } from 'rn-bounceable'
import { BounceableWind } from './styled'

export type BButtonVariant = 'primary' | 'primary-transparent' | 'secondary'

type Props = {
  label?: string
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
  children?: React.ReactNode
  /*
   * Bounceable doesn't work well inside a modal on Android, so we can replace it with TouchableNativeFeedback
   */
  replaceTouchableComponent?: boolean
  textClassName?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const mapButtonVariantToStyle: Record<
  BButtonVariant,
  { background: string; disabled: string; text: string }
> = {
  primary: {
    background: 'bg-orange-160',
    disabled: 'bg-orange-60',
    text: 'text-white text-lg text-center',
  },
  'primary-transparent': {
    background: 'bg-transparent border border-primary-orange',
    disabled: 'opacity-50',
    text: 'text-primary-orange text-lg text-center',
  },
  secondary: {
    background: 'bg-transparent border border-grey-280',
    disabled: 'opacity-50',
    text: 'text-grey-280 text-lg text-center',
  },
}

export const BButton: React.FC<Props> = ({
  label,
  onPress,
  buttonProps,
  variant = 'primary',
  buttonContainerStyle = undefined,
  containerClassName = '',
  isLoading = false,
  children,
  replaceTouchableComponent,
  textClassName,
  leftIcon,
  rightIcon,
}) => {
  const variantStyle = useMemo(() => {
    return mapButtonVariantToStyle[variant]
  }, [variant])

  const TouchComponent =
    Platform.OS === 'android' && replaceTouchableComponent
      ? TouchableNativeFeedback
      : BounceableWind

  return (
    <TouchComponent {...buttonProps} onPress={onPress}>
      <View
        className={cn([
          `flex items-center justify-center rounded-lg px-5 py-3`,
          containerClassName,
          !buttonContainerStyle ? 'p-2' : '',
          variantStyle.background,
          buttonProps?.disabled ? variantStyle.disabled : '',
        ])}
        style={[buttonContainerStyle ?? {}]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : children ? (
          children
        ) : (
          <View className="flex flex-row justify-between gap-2">
            {leftIcon}
            <Text className={cn([variantStyle.text, textClassName])}>{label}</Text>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchComponent>
  )
}
