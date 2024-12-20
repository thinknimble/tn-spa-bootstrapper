import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import axiosInstance from '../AxiosClient'
import {
  forgotPasswordShape,
  loginShape,
  resetPasswordShape,
  userCreateShape,
  userShape,
  userShapeWithToken,
} from './models'

const login = createCustomServiceCall({
  inputShape: loginShape,
  outputShape: userShapeWithToken,
  cb: async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
})

const signup = createCustomServiceCall({
  inputShape: userCreateShape,
  outputShape: userShapeWithToken,
  cb: async ({ client, input, utils }) => {
    const res = await client.post('/users/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
})

const requestPasswordReset = createCustomServiceCall({
  inputShape: forgotPasswordShape,
  cb: async ({ client, input, utils }) => {
    await client.post('/password/reset/', utils.toApi(input))
  },
})

const resetPassword = createCustomServiceCall({
  inputShape: resetPasswordShape,
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const { password } = utils.toApi(input)
    const res = await client.post(`/password/reset/confirm/${input.uid}/${input.token}/`, {
      password,
    })
    return utils.fromApi(res.data)
  },
})

const logout = createCustomServiceCall(async ({ client }) => {
  return client.post(`/logout/`)
})

export const userApi = createApi({
  client: axiosInstance,
  baseUri: '/users/',
  models: {
    entity: userShape,
  },
  customCalls: { login, requestPasswordReset, resetPassword, logout, signup },
})
