import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import axiosInstance from '../AxiosClient'
import { forgotPasswordShape, loginShape, userCreateShape, userShape } from './models'

const login = createCustomServiceCall({
  inputShape: loginShape,
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
})

const requestPasswordReset = createCustomServiceCall({
  inputShape: forgotPasswordShape,
  cb: async ({ client, input }) => {
    await client.get(`/password/reset/${input.email}/`)
  },
})
const resetPassword = createCustomServiceCall({
  inputShape: { uid: z.string().email(), token: z.string(), password: z.string() },
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    const { uid, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/code/confirm/${uid}/`, rest)
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
