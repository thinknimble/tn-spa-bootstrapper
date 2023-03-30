import axios, { AxiosError } from 'axios'
import { localStoreManager } from 'src/utils/local-store-manager'
// ToDo 1: test @ review app
// ToDo 2: remove .js version of get-cookie and rename
import getCookieTS from 'src/utils/get-cookie-ts'
const csrfToken = getCookieTS('csrftoken')
const axiosInstance = axios.create({
  //baseUrl will be determined by the server proxy in vite.config.js
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
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
