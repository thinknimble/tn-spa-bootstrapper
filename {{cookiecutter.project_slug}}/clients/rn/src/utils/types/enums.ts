const _languages = {
  system: 'System',
  en: 'EN',
  de: 'DE',
  ru: 'RU',
} as const
export type Language = keyof typeof _languages
export type LanguageUI = (typeof _languages)[Language]
export const languageToUI: Record<Language, LanguageUI> = {
  system: 'System',
  en: 'EN',
  de: 'DE',
  ru: 'RU',
}
export const languageUIToInternal: Record<LanguageUI, Language> = {
  System: 'system',
  EN: 'en',
  DE: 'de',
  RU: 'ru',
}
export const languages = Object.keys(languageToUI) as Language[]
export const languagesUI = Object.keys(languageUIToInternal) as LanguageUI[]

const _appearances = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const
export type Appearance = keyof typeof _appearances
export type AppearanceUI = (typeof _appearances)[Appearance]
export const appearanceToUI: Record<Appearance, AppearanceUI> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}
export const appearanceUIToInternal: Record<AppearanceUI, Appearance> = {
  System: 'system',
  Light: 'light',
  Dark: 'dark',
}
export const appearances = Object.keys(appearanceToUI) as Appearance[]
export const appearancesUI = Object.keys(appearanceUIToInternal) as AppearanceUI[]

export const successPerceptionEnum = {
  understandingMoney: 1,
  makingFewerImpulsePurchases: 2,
  payingExtraDebt: 3,
  buildingSavings: 4,
} as const

export type SuccessPerceptionValues =
  (typeof successPerceptionEnum)[keyof typeof successPerceptionEnum]

export const successPerceptionLabelMap: Record<SuccessPerceptionValues, string> = {
  [successPerceptionEnum.understandingMoney]:
    'I better understand my money between Wants and Needs.',
  [successPerceptionEnum.makingFewerImpulsePurchases]: "I'm making fewer impulse purchases.",
  [successPerceptionEnum.payingExtraDebt]: 'I make one extra payment on my debts',
  [successPerceptionEnum.buildingSavings]: "I've built up my savings.",
}

export const deleteAccountSurveyEnum = {
  notMakingProgress: 1,
  appNotValuable: 2,
  tooManyNotifications: 3,
  other: 4,
} as const

export type DeleteAccountSurveyValues =
  (typeof deleteAccountSurveyEnum)[keyof typeof deleteAccountSurveyEnum]

export const deleteAccountSurveyLabelMap: Record<SuccessPerceptionValues, string> = {
  [deleteAccountSurveyEnum.notMakingProgress]: "I'm not making progress on my financial goals.",
  [deleteAccountSurveyEnum.appNotValuable]: "The app isn't valuable to me.",
  [deleteAccountSurveyEnum.tooManyNotifications]: "I'm getting too many notifications.",

  [deleteAccountSurveyEnum.other]: 'Other',
}

export const checkInEmotionEnum = {
  excitement: 1,
  sadness: 2,
  fear: 3,
  envy: 4,
  other: 5,
} as const

export type CheckInEmotionValues = (typeof checkInEmotionEnum)[keyof typeof checkInEmotionEnum]

export const checkInEmotionLabelMap: Record<CheckInEmotionValues, string> = {
  [checkInEmotionEnum.excitement]: 'Excitement',
  [checkInEmotionEnum.sadness]: 'Sadness',
  [checkInEmotionEnum.fear]: 'Fear',
  [checkInEmotionEnum.envy]: 'Envy',
  [checkInEmotionEnum.other]: 'Other',
}

export const checkInStatusEnum = {
  want: 1,
  need: 2,
}
