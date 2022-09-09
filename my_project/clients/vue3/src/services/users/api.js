import { ModelAPI, objectToCamelCase } from '@thinknimble/tn-models'

import AxiosClient from '../AxiosClient'
import { apiErrorHandler } from '../api'

// NOTE: The AxiosClient is congfigured to include '/api' in the baseUrl
const LOGIN_ENDPOINT = '/login/'
const PASSWORD_RESET_EMAIL_ENDPOINT = '/password/reset/'
const PASSWORD_RESET_ENDPOINT = '/password/reset/confirm/'
const REGISTRATION_ENDPOINT = '/users/'
const USERS_ENDPOINT = '/users/'

export default class UserAPI extends ModelAPI {
  /**
   * ModelAPI contains methods for list and create (overridden here) and the FILTERS_MAP
   * You may override any of these methods by statically defining them here
   * e.g static FILTERS_MAP={...UserAPI.FILTERS_MAP, <FITERS>}
   *      list({ filters = {}, pagination = {} }){
   *
   * }
   */

  get client() {
    return AxiosClient
  }

  static ENDPOINT = USERS_ENDPOINT

  login(d) {
    const data = { email: d.email.toLowerCase(), password: d.password }
    return this.client
      .post(LOGIN_ENDPOINT, data)
      .then((response) => this.cls.fromAPI(response.data))
      .catch(
        apiErrorHandler({
          apiName: 'UserAPI.login',
          enable400Alert: false,
          enable500Alert: false
        }),
    )
  }

  registerUser(d) {
    const data = {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email.toLowerCase(),
      password: d.password,
    }
    return this.client
      .post(REGISTRATION_ENDPOINT, this.cls.toAPI(data))
      .then((response) => this.cls.fromAPI(response.data))
      .catch(
        apiErrorHandler({
          apiName: 'UserAPI.registerUser',
          enable400Alert: false,
          enable500Alert: false,
        }),
      )
  }

  requestPasswordReset(email) {
    const url = `${PASSWORD_RESET_EMAIL_ENDPOINT}?email=${email.toLowerCase()}`
    return this.client.get(url).catch(
      apiErrorHandler({
        apiName: 'UserAPI.requestPasswordReset',
      }),
    )
  }

  resetPassword({ uid, token, password }) {
    const url = `${PASSWORD_RESET_ENDPOINT}${uid}/${token}/`
    const data = { password }
    return this.client
      .post(url, data)
      .then((response) => this.cls.fromAPI(response.data))
      .catch(apiErrorHandler({ apiName: 'UserAPI.resetPassword' }))
  }
}
