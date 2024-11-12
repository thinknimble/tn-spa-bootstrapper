
import { cssInterop } from 'nativewind'
import ActionSheet from 'react-native-actions-sheet'

cssInterop(ActionSheet, {
  containerClassName: 'containerStyle',
  indicatorClassName: 'indicatorStyle',
})