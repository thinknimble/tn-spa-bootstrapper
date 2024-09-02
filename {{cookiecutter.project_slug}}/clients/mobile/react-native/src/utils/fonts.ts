//TODO: change this to your family, we're using montserrat as base. You could also add more family weights!
const baseFamily = 'Montserrat' as const
const fontFormat = 'ttf'

export const customFonts = {
  [`${baseFamily}-Black` as const]: require(`../../assets/fonts/${baseFamily}-Black.${fontFormat}`),
  [`${baseFamily}-BlackItalic` as const]: require(`../../assets/fonts/${baseFamily}-BlackItalic.${fontFormat}`),
  [`${baseFamily}-Bold` as const]: require(`../../assets/fonts/${baseFamily}-Bold.${fontFormat}`),
  [`${baseFamily}-BoldItalic` as const]: require(`../../assets/fonts/${baseFamily}-BoldItalic.${fontFormat}`),
  [`${baseFamily}-Italic` as const]: require(`../../assets/fonts/${baseFamily}-Italic.${fontFormat}`),
  [`${baseFamily}-Light` as const]: require(`../../assets/fonts/${baseFamily}-Light.${fontFormat}`),
  [`${baseFamily}-LightItalic` as const]: require(`../../assets/fonts/${baseFamily}-LightItalic.${fontFormat}`),
  [`${baseFamily}-Medium` as const]: require(`../../assets/fonts/${baseFamily}-Medium.${fontFormat}`),
  [`${baseFamily}-MediumItalic` as const]: require(`../../assets/fonts/${baseFamily}-MediumItalic.${fontFormat}`),
  [`${baseFamily}-Regular` as const]: require(`../../assets/fonts/${baseFamily}-Regular.${fontFormat}`),
}

type FontFamily = keyof typeof customFonts

export type FontWeightStyle =
  | 'light'
  | 'italic-light'
  | 'regular'
  | 'italic'
  | 'medium'
  | 'italic-medium'
  | 'black'
  | 'italic-black'
  | 'bold'
  | 'italic-bold'

export const fontFamilyWeightMap: Record<FontWeightStyle, FontFamily> = {
  light: `${baseFamily}-Light`,
  'italic-light': `${baseFamily}-LightItalic`,
  regular: `${baseFamily}-Regular`,
  italic: `${baseFamily}-Italic`,
  medium: `${baseFamily}-Medium`,
  'italic-medium': `${baseFamily}-MediumItalic`,
  black: `${baseFamily}-Black`,
  'italic-black': `${baseFamily}-BlackItalic`,
  bold: `${baseFamily}-Bold`,
  'italic-bold': `${baseFamily}-BoldItalic`,
}
