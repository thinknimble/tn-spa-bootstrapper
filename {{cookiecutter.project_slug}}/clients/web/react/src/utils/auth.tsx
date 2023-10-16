import { useLocation } from 'react-router-dom'

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
