import axios, { AxiosError } from 'axios'
import { localStoreManager } from 'src/utils/local-store-manager'
import { getCookie } from 'src/utils/get-cookie'

const baseURL = `${window.location.protocol}//${window.location.host}/api`

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStoreManager.token.get()
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
