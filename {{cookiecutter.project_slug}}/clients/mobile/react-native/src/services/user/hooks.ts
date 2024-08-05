/**
 * This is a service that handles all the user state without depending on the store
 *
 */

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@stores/auth'
import { userApi } from './api'
import { queryClient } from '@utils/query-client'

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


/**
 * To use directly in components
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: userApi.csc.logout,
    onSettled: () => {
      useAuth.getState().actions.clearAuth()
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}