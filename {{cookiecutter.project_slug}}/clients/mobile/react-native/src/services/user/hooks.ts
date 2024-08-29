/**
 * This is a service that handles all the user state without depending on the store
 *
 */

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@stores/auth'
import { userApi, userQueries } from '.'
import { queryClient } from '@utils/query-client'

export const useUser = () => {
  const userId = useAuth.use.userId()
  const { writeUserInStorage } = useAuth.use.actions()
  const query = useQuery(userQueries.retrieve(userId))

  useEffect(() => {
    if (query.isSuccess && query.data) {
      writeUserInStorage(query.data)
    }
  }, [query.data, query.isSuccess, writeUserInStorage])

  return query
}


/**
 * To use directly in components
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: userApi.csc.logout,
    onSettled: () => {
      useAuth.getState().actions.clearAuth()
      queryClient.invalidateQueries({ queryKey: userQueries.all() })
    },
  })
}