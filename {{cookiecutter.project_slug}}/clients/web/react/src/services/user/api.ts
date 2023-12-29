import { createApi, createApiUtils, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
import { userShape, forgotPasswordShape, userCreateShape, loginShape, LoginShape } from './models'

export const login = async (input: LoginShape) => {
  const { utils } = createApiUtils({
    inputShape: loginShape,
    outputShape: userShape,
    name: login.name,
  })
  const res = await axiosInstance.post('/login/', utils.toApi(input))
  return utils.fromApi(res.data)
}

const requestPasswordReset = createCustomServiceCall(
  {
    inputShape: forgotPasswordShape,
  },
  async ({ client, input }) => {
    await client.get(`/password/reset/${input.email}/`)
  },
)
const resetPassword = createCustomServiceCall(
  {
    inputShape: { email: z.string().email(), code: z.string(), password: z.string() },
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/code/confirm/${input.email}/`, rest)
    return utils.fromApi(res.data)
  },
)

export const userApi = createApi(
  {
    client: axiosInstance,
    baseUri: '/users/',
    models: {
      create: userCreateShape,
      entity: userShape,
    },
  },
  { requestPasswordReset, resetPassword },
)
