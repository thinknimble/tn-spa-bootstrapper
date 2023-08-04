{% if cookiecutter.use_graphql == 'y' -%}
import { useMutation } from '@apollo/client'
{% else -%}
{% endif -%}
import { ReactNode, useEffect, useMemo,useCallback} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
{% if cookiecutter.use_graphql == 'y' -%}
import { REFRESH_TOKEN, VERIFY_TOKEN } from './mutations'
import { useAuth, logout } from 'src/stores/auth'
{% endif -%}

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

{% if cookiecutter.use_graphql == 'y' -%}
/**
 * Set of effects to handle auth. Sync with external stores
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { changeToken, changeTokenExpirationDate } = useAuth.use.actions()
  const navigate = useNavigate()
  // check localStorage for an expiration datetime
  // if token is about to expire, refresh it
  const [refreshToken] = useMutation(REFRESH_TOKEN, {
    onCompleted: (data) => {
      
      changeToken(data.refreshToken.token)
      const exp: Date = new Date(data.refreshToken.payload.exp * 1000)
      changeTokenExpirationDate(exp.toISOString())
    },
    onError: (error) => console.error(error),
  })

  const checkTokenExpiration = useCallback(() => {
    const {tokenExpirationDate,token} = useAuth.getState()
    if (tokenExpirationDate && token) {
      const expDate = new Date(tokenExpirationDate)
      const timeRemaining = expDate.valueOf() - Date.now()
      const expiresSoon = timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD
      expiresSoon && refreshToken({ variables: { storedToken:token } })
    }
  }, [refreshToken])

  useInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL_MS)

  const [verifyToken] = useMutation(VERIFY_TOKEN, {
    onCompleted: (data) => {
      // use payload exp to set a countdown to refresh the token
      const exp: Date = new Date(data.verifyToken.payload.exp * 1000)
      changeTokenExpirationDate(exp.toISOString())
    },
    onError: (error) => {
      if (error.message === 'Signature has expired') {
        // if token is expired, user must re-authenticate
        logout()
        navigate('/log-in')
      } else {
        console.error(error)
      }
    },
  }) 
  
  return (
    <>
      {children}
    </>
  )
}
{% endif -%}
