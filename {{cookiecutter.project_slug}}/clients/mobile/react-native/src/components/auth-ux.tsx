import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native'
import { useServices } from '@services/index'
import { useUser } from '@services/user'
import { useAuth } from '@stores/auth'
import { FC, ReactNode, useCallback } from 'react'
import { LoadingRedirect } from './loading-redirect'
import { LoadingScreen } from './loading-screen'

/**
 * Auth guard to prevent users from sneaking into the app
 */
export const AuthUX: FC<{ children: ReactNode }> = ({ children }) => {
  const isAuth = useAuth((s) => Boolean(s.token))
  useUser()
  // clearAuth()
  const user = useAuth.use.user()
  const { navio } = useServices()

  const onAuthRedirect = useCallback(() => {
    //if the user is logged in, show set the root to be dashboard instead of main screen
    navio.setRoot('tabs', 'AppTabs')
  }, [navio])


  if (!isAuth) return <>{children}</>
  if (!user) {
    // clearAuth()
    return <LoadingScreen />
  }

  return <LoadingRedirect onRedirect={onAuthRedirect} />
}
