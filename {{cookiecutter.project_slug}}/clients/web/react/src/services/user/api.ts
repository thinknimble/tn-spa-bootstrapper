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

const login = createCustomServiceCall(
  {
    inputShape: loginShape,
    outputShape: userShapeWithToken,
  },
  async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
)

const signup = createCustomServiceCall(
  {
    inputShape: userCreateShape,
    outputShape: userShapeWithToken,
  },
  async ({ client, input, utils }) => {
    const res = await client.post('/users/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
)

const logout = createCustomServiceCall(async ({ client }) => {
  return client.post(`/logout/`)
})

const requestPasswordReset = createCustomServiceCall(
  {
    inputShape: forgotPasswordShape,
  },
  async ({ client, input }) => {
    await client.post(`/password/reset/`, input)
  },
)

const resetPassword = createCustomServiceCall(
  {
    inputShape: { userId: z.string(), token: z.string(), password: z.string() },
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const { token, user_id, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/confirm/${user_id}/${token}/`, rest)
    return utils.fromApi(res.data)
  },
)

const logout = createCustomServiceCall(async ({ client }) => {
  return client.post(`/logout/`)
})

export const userApi = createApi(
  {
    client: axiosInstance,
    baseUri: '/users/',
    models: {
      create: userCreateShape,
      entity: userShape,
    },
  },
  { login, logout, requestPasswordReset, resetPassword, signup },
)
