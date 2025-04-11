import { registerSheet } from 'react-native-actions-sheet'
import './styled'
import { sheets } from './sheets'

for (const s of Object.values(sheets)) {
  registerSheet(s.name, s)
}

export {}
