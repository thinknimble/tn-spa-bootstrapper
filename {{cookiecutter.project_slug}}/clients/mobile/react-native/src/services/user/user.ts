/**
 * This is a service that handles all the user state without depending on the store
 *
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../stores/auth'
import { userApi } from './api'

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
