import axios, { isAxiosError, AxiosError } from 'axios'
import qs from 'qs'
import { rollbar } from 'src/config/rollbar'
import { useAuth } from 'src/stores/auth'
import { getCookie } from 'src/utils/get-cookie'

const baseURL = `${window.location.protocol}//${window.location.host}/api`

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'comma' })
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const { token } = useAuth.getState()
    if (token) {
      const authHeader = `Token ${token}`
      const csrfToken = getCookie('csrftoken')
      if (config.headers) {
        config.headers.Authorization = authHeader
        config.headers['X-CSRFToken'] = csrfToken
      } else {
        config.headers = new axios.AxiosHeaders({
          Authorization: authHeader,
          'X-CSRFToken': csrfToken,
        })
      }
    }
    return { ...config }
  },
  (error: Error | AxiosError) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  async (config) => {
    return config
  },
  (err: unknown) => {
    if (isAxiosError(err)) {
      if (err.response?.data.detail === 'Invalid token.') {
        //token has become invalid, clear the store so the app recovers
        useAuth.getState().actions.clearAuth()
        window.location.replace('/')
      }

      // Report backend blowups (5xx) and connectivity failures (no response),
      // which TanStack Query otherwise swallows so they never reach Rollbar's
      // global handlers. Skip expected 4xx (validation/auth/not-found) and
      // requests React Query canceled on unmount — both are noise, not bugs.
      const status = err.response?.status
      const isCanceled = err.code === 'ERR_CANCELED'
      if (!isCanceled && (!err.response || (status ?? 0) >= 500)) {
        rollbar.error('API error', err, {
          url: err.config?.url,
          method: err.config?.method,
          status: status ?? 'network',
        })
      }
    }
    return Promise.reject(err)
  },
)
