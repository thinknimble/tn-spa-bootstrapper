import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import axiosInstance from '../AxiosClient'
import {
  forgotPasswordShape,
  loginShape,
  resetPasswordShape,
  userCreateShape,
  userShape,
} from './models'

const login = createCustomServiceCall({
  inputShape: loginShape,
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    console.log(res)
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
    create: userCreateShape,
    entity: userShape,
  },
  customCalls: { login, requestPasswordReset, resetPassword, logout },
})

export const organizationApi = createApi({
  client: axiosInstance,
  baseUri: '/organizations/',
  models: {
    entity: {
      id: z.string(),
      name: z.string(),
    },
  },
})
