import { FontSource } from 'expo-font'

//TODO: change this to your family, we're using monserrat as base. You could also add more family weights!
const baseFamily = 'Montserrat' as const
const fontFormat = 'ttf'

const fontFamilyVariants = [
  'Black',
  'BlackItalic',
  'Bold',
  'BoldItalic',
  'Italic',
  'Light',
  'LightItalic',
  'Medium',
  'MediumItalic',
  'Regular',
] as const
type FontFamilyVariantValues = typeof fontFamilyVariants[number]

type FontVariantSourceMap = {
  [K in FontFamilyVariantValues as `${typeof baseFamily}-${K}`]: FontSource
}

export const customFonts = Object.fromEntries(
  fontFamilyVariants.map((ffv) => {
    const identifier = `${baseFamily}-${ffv}` as const
    return [identifier, require(`../../assets/${identifier}.${fontFormat}`)]
  }),
) as FontVariantSourceMap

type FontFamily = keyof FontVariantSourceMap

export type FontWeightsStyle =
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

export const fontFamilyWeightMap: Record<FontWeightsStyle, FontFamily> = {
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
