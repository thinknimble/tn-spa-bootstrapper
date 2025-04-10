import { cssInterop } from 'nativewind'
import type { FC } from 'react'
import { Bounceable } from 'rn-bounceable'

cssInterop(Bounceable, {
  contentContainerClassName: 'contentContainerStyle',
})

export const BounceableWind = Bounceable as FC<ExtendedBounceableProps>
