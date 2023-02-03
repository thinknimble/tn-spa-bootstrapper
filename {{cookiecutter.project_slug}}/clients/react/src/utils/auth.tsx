import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getUserInfo } from 'src/services/auth'
import { localStoreManager } from './local-store-manager'

// create a mechanism for authenticating each request that is sent
// 1. verify token that's stored in localStorage
// 1a. redirect to sign-in if there is no token stored
// 2. refresh token if exp is < 1min from now
// 2a. unset localStorage token & exp on logout
// 2b. call client.clearStore() on logout

/**
 * Read router state to determine whether a user should be redirected to a certain page after logging in.
 * Extract a "from" property from the router state and return that or the default followup route provided (or home)
 * @param defaultLocation Provide a fallback for the location if there was no followup route in router state. If undefined it sets home as the default location
 */
export const useFollowupRoute = (defaultLocation = '/') => {
  const { state: routerState } = useLocation()

  // need to narrow down unknown
  return routerState &&
    typeof routerState === 'object' &&
    'from' in routerState &&
    routerState?.from
    ? routerState.from
    : defaultLocation
}

export function logout(onLogout?: () => void) {
  localStoreManager.token.remove()
  localStoreManager.expirationDate.remove()
  localStoreManager.userId.remove()
  onLogout?.()
}

type AuthState = {
  token: string | null
  updateToken: (token: string | null) => void
  userId: string | null
  updateUserId: (id: string | null) => void
}

export const AuthContext = createContext<AuthState>({
  userId: null,
  updateUserId: (id) => undefined,
  token: null,
  updateToken: (token) => undefined, // set default signature to expect function
})

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('usAuth should be used under AuthContextProvider')
  }
  return ctx
}

export const useUser = () => {
  const { token, userId, updateToken, updateUserId } = useAuth()
  const navigate = useNavigate()
  return useQuery(['user', userId], {
    queryFn: () => {
      if (!userId) return
      return getUserInfo(userId)
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.status === 401) {
        // the token is no longer valid so strip them from it and ask them to log back in
        localStoreManager.token.remove()
        localStoreManager.userId.remove()
        updateUserId(null)
        updateToken(null)
        navigate('/login')
      }
    },
    retry: 1,
    enabled: Boolean(userId),
  })
}

const useSyncAuthWithLocalStorage = () => {
  const { token, updateToken, updateUserId, userId } = useAuth()

  useEffect(() => {
    if (token && userId) {
      localStoreManager.token.set(token)
      localStoreManager.userId.set(userId)
    }
  }, [token, userId])

  useEffect(() => {
    const localStorageToken = localStoreManager.token.get()
    const localStorageUserId = localStoreManager.userId.get()
    if (localStorageToken && localStorageUserId) {
      updateToken(localStorageToken)
      updateUserId(localStorageUserId)
    }
  }, [updateToken, updateUserId])
}

const AuthInner: FC<{ children: ReactNode }> = ({ children }) => {
  // cache user information for it to be available across the app
  useUser()
  useSyncAuthWithLocalStorage()
  return <>{children}</>
}

/**
 * Set of effects to handle auth. Sync with external stores
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const auth: AuthState = { token, updateToken: setToken, updateUserId: setUserId, userId }
  return (
    <AuthContext.Provider value={auth}>
      <AuthInner>{children}</AuthInner>
    </AuthContext.Provider>
  )
}
