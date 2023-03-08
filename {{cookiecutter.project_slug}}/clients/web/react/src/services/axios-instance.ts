import axios, { AxiosError } from 'axios'
import { localStoreManager } from 'src/utils/local-store-manager'
const axiosInstance = axios.create({
  //baseUrl will be determined by the server proxy in vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStoreManager.token.get()
    if (token) {
      const authHeader = `Token ${token}`
      if (config.headers) {
        config.headers.Authorization = authHeader
      } else {
        config.headers = new axios.AxiosHeaders({
          Authorization: authHeader,
        })
      }
    }
    return { ...config }
  },
  (error: Error | AxiosError) => {
    return Promise.reject(error)
  },
)

export { axiosInstance as axios }
