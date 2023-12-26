/**
 * This is a service that handles all the user state without depending on the store
 *
 */

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@stores/auth'
import { userApi } from './api'

export const useUser = () => {
  const userId = useAuth.use.userId()
  const { writeUserInStorage } = useAuth.use.actions()
  const data = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const user = await userApi.retrieve(userId)
      return user
    },
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (data.isSuccess && data.data) {
      writeUserInStorage(data.data)
    }
  }, [data.data, data.isSuccess, writeUserInStorage])

  return data
}
