import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'src/stores/auth'
import { userApi } from './api'
import { useEffect } from 'react'

export const useUser = () => {
  const userId = useAuth.use.userId()
  const { writeUserInStorage } = useAuth.use.actions()
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const user = await userApi.retrieve(userId)
      return user
    },
    enabled: Boolean(userId),
  })

  useEffect(() => {
    //sync with localStorage
    if (query.data) writeUserInStorage(query.data)
  }, [query.data, writeUserInStorage])

  return query
}
