import { objectToCamelCase, objectToSnakeCase } from '@thinknimble/tn-utils'
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
    // make sure we send snake_case'd requests
    const newData = objectToSnakeCase(config.data)
    return { ...config, data: newData }
  },
  (error: Error | AxiosError) => {
    Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  async (response) => {
    // parse response so that it is camelCase
    const newData = objectToCamelCase(response.data)
    return {
      ...response,
      data: newData,
    }
  },
  (error: Error | AxiosError) => {
    Promise.reject(error)
  },
)

export { axiosInstance as axios }
