import { useAuth } from '@stores/auth'
import axios, { AxiosError } from 'axios'
import qs from 'qs'
import Config from '../../Config'

const baseUrl =
  Config?.backendServerUrl && Config?.backendServerUrl.endsWith('/')
    ? Config?.backendServerUrl.substring(0, Config?.backendServerUrl.length - 1)
    : `${Config?.backendServerUrl}`
export const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
})
console.log('axiosInstance', `${baseUrl}/api`)
axiosInstance.interceptors.request.use(
  async (config) => {
    const { token } = useAuth.getState()
    if (token) {
      const authHeader = `Token ${token}`
      if (config.headers) {
        config.headers.Authorization = authHeader
      } else {
        const newHeaders = new axios.AxiosHeaders()
        newHeaders.setAuthorization(authHeader)
        config.headers = newHeaders
      }
    }
    return { ...config }
  },
  (error: Error | AxiosError) => {
    Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  async (config) => {
    return config
  },
  (err: unknown) => {
    if (
      err instanceof AxiosError &&
      err.response &&
      err.response.data &&
      typeof err.response.data === 'object' &&
      'detail' in err.response.data &&
      err.response.data.detail === 'Invalid token.'
    ) {
      //token has become invalid, clear the store so the app recovers
      useAuth.getState().actions.clearAuth()
    }
    return Promise.reject(err)
  },
)
