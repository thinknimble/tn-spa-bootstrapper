import { createApi, createCustomServiceCall, GetInferredFromRaw } from '@thinknimble/tn-models'
import { z } from 'zod'
import { forgotPasswordShape, loginShape, userCreateShape, userShape } from './models'

const login = createCustomServiceCall(
  {
    inputShape: loginShape,
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const res = await client.post('/login/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
)

const requestPasswordResetCode = createCustomServiceCall(
  {
    inputShape: forgotPasswordShape,
  },
  async ({ client, input }) => {
    await client.get(`/password/reset/code/${input.email}/`)
  },
)

const resetPassword = createCustomServiceCall(
  {
    inputShape: {
      email: z.string().email(),
      code: z.string(),
      password: z.string(),
    },
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const { email, ...rest } = utils.toApi(input)
    const res = await client.post(`/password/reset/code/confirm/${email}/`, rest)
    return utils.fromApi(res.data)
  },
)
const refreshPubnubTokenResponseShape = {
  chatAuthToken: z.string().optional(),
}
export type RefreshPubnubTokenResponse = GetInferredFromRaw<typeof refreshPubnubTokenResponseShape>

export const refreshPubnubToken = createCustomServiceCall(
  {
    outputShape: refreshPubnubTokenResponseShape,
  },
  async ({ client, utils }) => {
    const res = await client.get(`/chat/refresh-token/`)
    const response = utils.fromApi(res.data)
    return response
  },
)

//TODO: Would be nice if we could just instantiate axios here as well rather than in each client... Each one has a different way of setting their baseUrl so we cannot do it here right now DL 9/23
export const buildUserApi = (client: Parameters<typeof createApi>[0]['client']) =>
  createApi(
    {
      client,
      baseUri: '/users/',
      models: {
        create: userCreateShape,
        entity: userShape,
      },
    },
    { login, requestPasswordResetCode, resetPassword, refreshPubnubToken },
  )
