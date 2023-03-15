import { FC } from 'react'
import { fontFamilyWeightMap, FontWeightStyle } from '../utils/fonts'
import { Text as TextRN, TextProps } from 'react-native'

export const Text: FC<
  Omit<TextProps, 'className'> & { variant?: FontWeightStyle; textClassName?: string }
> = ({ variant = 'regular', textClassName = '', ...props }) => {
  console.log('applying this?', `font-variant-${fontFamilyWeightMap[variant]} ${textClassName}`)
  return <TextRN {...props} className={`font-variant-${variant} ${textClassName}`} />
}
