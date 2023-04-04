import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'

export class OnStartService implements IService {
  private inited = false

  init = async (): PVoid => {
    if (!this.inited) {
      await this.loadAssets()

      this.inited = true
    }
  }

  private loadAssets = async () => {
    const fonts = [Ionicons.font]

    const fontAssets = fonts.map((font) => Font.loadAsync(font))

    await Promise.all([...fontAssets])
  }
}
