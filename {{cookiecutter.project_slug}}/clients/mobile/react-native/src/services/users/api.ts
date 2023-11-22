{%- if cookiecutter.include_services_core == 'y' and cookiecutter.include_mobile == 'y' and cookiecutter.client_app != 'None' %}
import { buildUserApi } from 'services-core'
import { axiosInstance } from '../axios-instance'

export const userApi = buildUserApi(axiosInstance)
{%- else %}
import { createApi, createCustomServiceCall } from '@thinknimble/tn-models'
import { z } from 'zod'
import { axiosInstance } from '../axios-instance'
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
    inputShape: { email: z.string().email(), code: z.string(), password: z.string() },
    outputShape: userShape,
  },
  async ({ client, input, utils }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  { login, requestPasswordResetCode, resetPassword },
)
{%- endif %}
