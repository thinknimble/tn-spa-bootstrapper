import type { MyNavio } from '@screens/routes'
import { atom } from 'jotai'

export const navioAtom = atom<MyNavio | null>(null)
