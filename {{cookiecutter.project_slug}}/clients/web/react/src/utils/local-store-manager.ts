const AUTH_TOKEN_KEY = `auth-token`
const EXPIRATION_DATE_KEY = `expiration-date`
const USER_ID_KEY = `user-id`

/**
 * Single entrypoint to local storage so that we prevent messing up the keys
 */
export const localStoreManager = {
  token: {
    get: () => localStorage.getItem(AUTH_TOKEN_KEY),
    set: (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token),
    remove: () => localStorage.removeItem(AUTH_TOKEN_KEY),
  },
  expirationDate: {
    get: () => localStorage.getItem(EXPIRATION_DATE_KEY),
    remove: () => localStorage.removeItem(EXPIRATION_DATE_KEY),
    set: (dateStr: string) => localStorage.setItem(EXPIRATION_DATE_KEY, dateStr),
  },
  userId: {
    set: (id: string) => localStorage.setItem(USER_ID_KEY, id),
    remove: () => localStorage.removeItem(USER_ID_KEY),
    get: () => localStorage.getItem(USER_ID_KEY),
  },
}
