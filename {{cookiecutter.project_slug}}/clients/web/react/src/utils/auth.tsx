{% if cookiecutter.use_graphql == 'y' -%}
import { useMutation } from '@apollo/client'
{% else -%}
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
{% endif -%}
import { createContext, FC, ReactNode, useContext, useEffect, useState ,useMemo ,useCallback} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
{% if cookiecutter.use_graphql == 'y' -%}
import {client} from 'src/services/apollo-client'
import { REFRESH_TOKEN, VERIFY_TOKEN } from './mutations'
{% else -%}
import { userApi } from '../services/user/index'
{% endif -%}
import { localStoreManager } from './local-store-manager'

// create a mechanism for authenticating each request that is sent
// 1. verify token that's stored in localStorage
// 1a. redirect to sign-in if there is no token stored
// 2. refresh token if exp is < 1min from now
// 2a. unset localStorage token & exp on logout
// 2b. call client.clearStore() on logout

{% if cookiecutter.use_graphql=='y' -%}
const TOKEN_CHECK_INTERVAL_MS = 60000
const REFRESH_THRESHOLD = 60000
const useInterval = (fn: () => void, intervalMs: number) => {
  useEffect(() => {
    const intervalId = setInterval(fn, intervalMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [fn, intervalMs])
}
{% endif -%}

/**
 * Read router state to determine whether a user should be redirected to a certain page after logging in.
 * Extract a "from" property from the router state and return that or the default followup route provided (or home)
 * @param defaultLocation Provide a fallback for the location if there was no followup route in router state. If undefined it sets home as the default location
 */
export const useFollowupRoute = (defaultLocation = '/home') => {
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
{% if cookiecutter.use_graphql == 'y' -%}
  client.clearStore()
{% endif -%}
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

{% if cookiecutter.use_graphql=='n' -%}
export const useUser = () => {
  const { userId, updateToken, updateUserId } = useAuth()
  const navigate = useNavigate()
  return useQuery(['user', userId], {
    queryFn: () => {
      if (!userId) return
      return userApi.retrieve(userId)
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
{% endif -%}

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
  {% if cookiecutter.use_graphql == 'n' -%}
  useUser()
  {% endif -%}
  useSyncAuthWithLocalStorage()
  return <>{children}</>
}

/**
 * Set of effects to handle auth. Sync with external stores
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

{% if cookiecutter.use_graphql == 'y' -%}
  const navigate = useNavigate()
  // check localStorage for an auth token
  const storedToken = localStoreManager.token.get()

  // check localStorage for an expiration datetime
  // if token is about to expire, refresh it
  const [refreshToken] = useMutation(REFRESH_TOKEN, {
    onCompleted: (data) => {
      localStoreManager.token.set(data.refreshToken.token)
      const exp: Date = new Date(data.refreshToken.payload.exp * 1000)
      localStoreManager.expirationDate.set(exp.toISOString())
    },
    onError: (error) => console.error(error),
  })

  const checkTokenExpiration = useCallback(() => {
    const storedExpDate = localStoreManager.expirationDate.get()
    const storedToken = localStoreManager.token.get()
    if (storedExpDate && storedToken) {
      const expDate = new Date(storedExpDate)
      const timeRemaining = expDate.valueOf() - Date.now()
      const expiresSoon = timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD
      expiresSoon && refreshToken({ variables: { storedToken } })
    }
  }, [refreshToken])

  useInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL_MS)

  const [verifyToken] = useMutation(VERIFY_TOKEN, {
    onCompleted: (data) => {
      // use payload exp to set a countdown to refresh the token
      const exp: Date = new Date(data.verifyToken.payload.exp * 1000)
      localStoreManager.expirationDate.set(exp.toISOString())
    },
    onError: (error) => {
      if (error.message === 'Signature has expired') {
        // if token is expired, user must re-authenticate
        setToken(null)
        localStoreManager.expirationDate.remove()
        logout()
        navigate('/log-in')
      } else {
        console.error(error)
      }
    },
  }) 
{% endif -%}

  const auth: AuthState = useMemo(()=>(
    { token, updateToken: setToken, updateUserId: setUserId, userId }
  ),[token,userId])

  return (
    <AuthContext.Provider value={auth}>
      <AuthInner>{children}</AuthInner>
    </AuthContext.Provider>
  )
}
