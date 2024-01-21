import { FC, useEffect } from 'react'
import { LoadingScreen } from './loading-screen'

export const LoadingRedirect: FC<{ onRedirect: () => void }> = ({ onRedirect }) => {
  useEffect(() => {
    setTimeout(() => {
      onRedirect()
    }, 0)
  }, [onRedirect])

  return <LoadingScreen />
}
