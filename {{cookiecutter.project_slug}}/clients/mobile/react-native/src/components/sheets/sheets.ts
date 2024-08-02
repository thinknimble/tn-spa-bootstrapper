import { Sample } from './sample-sheet'

// add any sheets here and they will be registered in the app
export const sheets = {
  test: Sample,
} as const

export const SHEET_NAMES = Object.fromEntries(
  Object.entries(sheets).map(([k, v]) => [k, v.name]),
) as Record<keyof typeof sheets, string>

export type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES]