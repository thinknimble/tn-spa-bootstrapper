import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
import { forgotPasswordShape, loginShape, userCreateShape, userShape } from './models'

const login = createCustomServiceCall({
  inputShape: loginShape,
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
})

const requestPasswordResetCode = createCustomServiceCall({
  inputShape: forgotPasswordShape,
  cb: async ({ client, input, utils }) => {
    await client.post(`/password/reset/`, utils.toApi(input))
  },
})

const resetPassword = createCustomServiceCall({
  inputShape: { email: z.string().email(), code: z.string(), password: z.string() },
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/confirm/${input.email}/`, rest)
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
  customCalls: { login, requestPasswordResetCode, resetPassword, logout },
})
