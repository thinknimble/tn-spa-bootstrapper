import { useServices } from '@services/index'
import AngleLeft from './icons/AngleLeft'
import { BounceableWind } from './styled'

export const BackButton = ({ size = 24 }) => {
  const { navio } = useServices()
  return (
    <BounceableWind
      onPress={() => {
        navio.goBack()
      }}
    >
      <AngleLeft color="white" size={size} />
    </BounceableWind>
  )
}
