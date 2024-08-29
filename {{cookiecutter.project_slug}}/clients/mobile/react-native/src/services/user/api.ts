import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
import { forgotPasswordShape, loginShape, partialUserShape, userCreateShape, userShape } from './models'

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
  cb: async ({ client, input }) => {
    await client.get(`/password/reset/code/${input.email}/`)
  },
})

const resetPassword = createCustomServiceCall({
  inputShape: { email: z.string().email(), code: z.string(), password: z.string() },
  outputShape: userShape,
  cb: async ({ client, input, utils }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/code/confirm/${input.email}/`, rest)
    return utils.fromApi(res.data)
  },
})

const logout = createCustomServiceCall(async ({ client }) => {
  return client.post(`/logout/`)
})

const patchUser = createCustomServiceCall({
  inputShape: partialUserShape,
  outputShape: userShape,
  cb: async ({ client, slashEndingBaseUri, input, utils }) => {
    const { id, ...body } = utils.toApi(input)
    const res = await client.put(`${slashEndingBaseUri}${id}/`, body)
    return utils.fromApi(res.data)
  },
})

export const userApi = createApi({
  client: axiosInstance,
  baseUri: '/users/',
  models: {
    create: userCreateShape,
    entity: userShape,
  },
  customCalls: { login, requestPasswordResetCode, resetPassword, logout, patchUser },
})
