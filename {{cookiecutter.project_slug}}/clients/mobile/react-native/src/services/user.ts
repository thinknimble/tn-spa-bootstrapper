import { useQuery } from '@tanstack/react-query'
import {
  createApi,
  GetZodInferredTypeFromRaw,
} from '@thinknimble/tn-models'
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
}
export type UserCreate = GetZodInferredTypeFromRaw<typeof createUserShape>

export const userShape = {
  id: userFields.id,
  fullName: userFields.fullName,
  ...createUserShape,
}

export type User = GetZodInferredTypeFromRaw<typeof userShape>

export const userApi = createApi({
  client: axiosInstance,
  endpoint: 'api/users',
  models: {
    create: createUserShape,
    entity: userShape,
  },
})

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
