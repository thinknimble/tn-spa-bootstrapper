import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import axiosInstance from '../AxiosClient'
import {
  userShape,
  forgotPasswordShape,
  resetPasswordShape,
  userCreateShape,
  loginShape
} from './models'

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

const requestPasswordReset = createCustomServiceCall(
  {
    inputShape: forgotPasswordShape,
  },
  async ({ client, input, utils }) => {
    const res = await client.post('/password/reset/', utils.toApi(input))
    return utils.fromApi(res.data)
  },
)

const resetPassword = createCustomServiceCall(
  {
    inputShape: resetPasswordShape,
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    const { password } = utils.toApi(input)
    const res = await client.post(`/password/reset/confirm/${input.uid}/${input.token}/`, {
      password,
    })
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
  { login, requestPasswordReset, resetPassword, logout },
)
