import { FC } from 'react'
import { Text as TextRN, TextProps } from 'react-native'
import { fontFamilyWeightMap, FontWeightStyle } from '../utils/fonts'

export const Text: FC<
  Omit<TextProps, 'className'> & { variant?: FontWeightStyle; textClassName?: string }
> = ({ variant = 'regular', textClassName = '', ...props }) => {
  return (
    <TextRN
      {...props}
      className={textClassName}
      style={{
        fontFamily: fontFamilyWeightMap[variant],
      }}
    />
  )
}
