import { FC } from 'react'
import { Text as TextRN, TextProps } from 'react-native'
import { fontFamilyWeightMap, FontWeightStyle } from '../utils/fonts'

export const Text: FC<
  Omit<TextProps, 'className'> & { variant?: FontWeightStyle; textClassName?: string }
> = ({ variant = 'regular', textClassName = '', ...props }) => {
  const style = {
    fontFamily: fontFamilyWeightMap[variant],
  }
  return <TextRN {...props} className={textClassName} style={style} />
}
