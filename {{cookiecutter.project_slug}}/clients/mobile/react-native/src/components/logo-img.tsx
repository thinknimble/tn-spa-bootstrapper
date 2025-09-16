import { Image } from 'react-native'
import logo from '@assets/icon.png'
import { FC } from 'react'
import { cn } from '@utils/style'

export const LogoImg: FC<{ className?: string }> = ({ className }) => {
  return <Image source={logo} className={cn(['w-20 h-20', className])} resizeMode="contain" />
}
