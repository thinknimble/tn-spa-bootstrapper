import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
import {
  forgotPasswordShape,
  loginShape,
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

const logout = createCustomServiceCall(async ({ client }) => {
  return client.post(`/logout/`)
})

const requestPasswordReset = createCustomServiceCall({
  inputShape: forgotPasswordShape,
  cb: async ({ client, input }) => {
    await client.post(`/password/reset/`, input)
  },
})

const resetPassword = createCustomServiceCall({
  inputShape: { email: z.string(), code: z.string(), password: z.string() },
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/confirm/${email}/`, rest)
    return utils.fromApi(res.data)
  },
})

export const userApi = createApi({
  client: axiosInstance,
  baseUri: '/users/',
  models: {
    entity: userShape,
  },
  customCalls: { login, logout, requestPasswordReset, resetPassword, signup },
})
