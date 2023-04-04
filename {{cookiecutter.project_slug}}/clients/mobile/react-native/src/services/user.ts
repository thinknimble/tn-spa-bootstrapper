import { useQuery } from '@tanstack/react-query'
import { createApi, createApiUtils, GetInferredFromRaw } from '@thinknimble/tn-models-fp'
import { z } from 'zod'
import { useAuth } from '../stores/auth'
import { axiosInstance } from './axios-instance'

export const fullNameZod = z.string().refine(
  (value) => {
    return value.split(' ').filter(Boolean).length >= 2
  },
  { message: 'Please provide a full name' },
)

const userFields = {
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().max(255),
  lastName: z.string().max(255),
  fullName: fullNameZod,
}

const createUserShape = {
  email: userFields.email,
  firstName: userFields.firstName,
  lastName: userFields.lastName,
  password: z.string(),
}
export type UserCreate = GetInferredFromRaw<typeof createUserShape>

export const userShape = {
  id: userFields.id,
  fullName: userFields.fullName,
  ...createUserShape,
}

export type User = GetInferredFromRaw<typeof userShape>

export const userApi = createApi({
  client: axiosInstance,
  baseUri: 'api/users',
  models: {
    create: createUserShape,
    entity: userShape,
  },
})

const loginShape = {
  email: z.string().email(),
  password: z.string(),
}

type LoginInput = GetInferredFromRaw<typeof loginShape>

export const postLogin = async (input: LoginInput) => {
  const {
    utils: { fromApi, toApi },
  } = createApiUtils({
    inputShape: loginShape,
    name: postLogin.name,
    outputShape: userShape,
  })
  const res = await axiosInstance.post('login/', toApi(input))

  return fromApi(res.data)
}

export const useUser = () => {
  const userId = useAuth.use.userId()
  const user = useAuth.use.user()
  const { writeUserInStorage } = useAuth.use.actions()
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const user = await userApi.retrieve(userId)
      return user
    },
    enabled: Boolean(userId),
    onSuccess: (user) => {
      writeUserInStorage(user)
    },
  })
}
