import axios from 'axios'
import store from '@/store'
import CSRF from '@/services/csrf'

/**
 *   Get the axios API client.
 *   This conveniently sets the `baseURL` and `headers` for the API client,
 *   so that we don't have to do this in every function that needs to call
 *   the API.
 *   This will automaticaly proxy requrests to /api/
 *   if the /api/ route is already included the vue.config.js will overwrite it
 *
 *
 *   @returns {object} - An instance of the axios API client.
 */

class ApiService {
  static session
  static init
  constructor() {
    let base_url = `${window.location.protocol}//${window.location.hostname}`

    console.debug(`API Service for ${base_url}`)

    ApiService.session = axios.create({
      baseURL: base_url,
      headers: {
        ...CSRF.getHeaders(),
      },
    })
    ApiService.session.interceptors.request.use(
      async (config) => {
        const token = store.state.auth?.user?.token || null
        if (token) {
          config.headers['Authorization'] = `Token ${token}`
        }
        return config
      },
      (error) => {
        Promise.reject(error)
      },
    )
  }

  static get instance() {
    if (!ApiService.init) {
      new ApiService()
      ApiService.init = true
    }
    return ApiService.session
  }
}

export default ApiService.instance
// extend and use
export { ApiService }
