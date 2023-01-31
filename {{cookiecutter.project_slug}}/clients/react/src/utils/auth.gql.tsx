import { useMutation } from '@apollo/client'
import React, { FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { client } from 'src/apollo-client'
import { localStoreManager } from './local-store-manager'
import { REFRESH_TOKEN, VERIFY_TOKEN } from './mutations'

// create a mechanism for authenticating each request that is sent
// 1. verify token that's stored in localStorage
// 1a. redirect to sign-in if there is no token stored
// 2. refresh token if exp is < 1min from now
// 2a. unset localStorage token & exp on logout
// 2b. call client.clearStore() on logout

type AuthState = {
  token: string | null
  updateToken: (token: string) => void
  userId: string | null
  updateUserId: (id: string) => void
}

function logout() {
  client.clearStore()
  localStoreManager.userId.remove()
  localStoreManager.token.remove()
  localStoreManager.expirationDate.remove()
}

const useInterval = (fn: () => void, intervalMs: number) => {
  useEffect(() => {
    const intervalId = setInterval(fn, intervalMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [fn, intervalMs])
}

export const AuthContext = React.createContext<AuthState>({
  userId: null,
  updateUserId: (id: string) => undefined,
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

const useSyncAuthWithLocalStorage = () => {
  const { token, updateToken, userId, updateUserId } = useAuth()

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

/**
 * Need an inner component to access context and perform syncing
 */
const AuthInner: FC<{ children: ReactNode }> = ({ children }) => {
  useSyncAuthWithLocalStorage()

  return <>children</>
}

const TOKEN_CHECK_INTERVAL_MS = 60000
const REFRESH_THRESHOLD = 60000

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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

  const auth: AuthState = { token, updateToken: setToken, updateUserId: setUserId, userId: userId }

  return (
    <AuthContext.Provider value={auth}>
      <AuthInner>{children}</AuthInner>
    </AuthContext.Provider>
  )
}
