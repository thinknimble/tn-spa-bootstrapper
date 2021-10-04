import { ModelAPI, objectToCamelCase } from '@thinknimble/tn-models'

import AxiosClient from '../AxiosClient'
import { apiErrorHandler } from '../api'

const LOGIN_ENDPOINT = 'api/login/'
const PASSWORD_RESET_EMAIL_ENDPOINT = ''
const PASSWORD_RESET_ENDPOINT = ''
const REGISTRATION_ENDPOINT = ''
const USERS_ENDPOINT = 'api/users/'

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
    const promise = AxiosClient.post(LOGIN_ENDPOINT, data).catch(
      apiErrorHandler({ apiName: 'UserAPI.login', enable400Alert: false, enable500Alert: false }),
    )
    return promise
  }

  registerUser(registerForm) {
    const data = registerForm

    return this.client
      .post(REGISTRATION_ENDPOINT, this.cls.toAPI(data))
      .then((response) => response.data)
      .then((data) => this.cls.fromAPI(data))
      .catch(
        apiErrorHandler({
          apiName: 'Register User',
          enable400Alert: true,
          enable500Alert: true,
        }),
      )
  }

  requestPasswordReset(email) {
    const url = `${PASSWORD_RESET_EMAIL_ENDPOINT}${email.toLowerCase()}/`
    const obj = {
      email: email,
    }

    return this.client
      .get(url, obj)
      .then((response) => objectToCamelCase(response))
      .catch(
        apiErrorHandler({
          apiName: 'Request Password Reset API',
        }),
      )
  }

  resetPassword(formVal) {
    const url = `${PASSWORD_RESET_ENDPOINT}${formVal.uid}/${formVal.token}/`
    const data = {
      password: formVal.password,
    }
    return this.client
      .post(url, data)
      .then((response) => this.cls.fromAPI(response.data))
      .catch(apiErrorHandler({ apiName: 'API error' }))
  }
}
