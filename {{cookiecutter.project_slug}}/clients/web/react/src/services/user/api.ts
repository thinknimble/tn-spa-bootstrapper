import { createApi, createCustomServiceCall } from '@thinknimble/tn-models-fp'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
import { userShape, forgotPasswordShape, userCreateShape, loginShape } from './models'

const login = createCustomServiceCall(
  {
    inputShape: loginShape,
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const res = await client.post('api/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
)

const requestPasswordResetCode = createCustomServiceCall(
  {
    inputShape: forgotPasswordShape,
  },
  async ({ client, input }) => {
    await client.get(`api/password/reset/code/${input.email}/`)
  },
)
const resetPassword = createCustomServiceCall(
  {
    inputShape: { email: z.string().email(), code: z.string(), password: z.string() },
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`api/password/reset/code/confirm/${input.email}/`, rest)
    return utils.fromApi(res.data)
  },
)

export const userApi = createApi(
  {
    client: axiosInstance,
    baseUri: 'api/users/',
    models: {
      create: userCreateShape,
      entity: userShape,
    },
  },
  { login, requestPasswordResetCode, resetPassword },
)
