import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'src/stores/auth'
import { userApi } from './api'
import { useEffect } from 'react'
import { HttpStatusCode, isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

export const useUser = () => {
  const { clearAuth } = useAuth.use.actions()
  const userId = useAuth.use.userId()
  const { writeUserInStorage } = useAuth.use.actions()
  const navigate = useNavigate()
  
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

  useEffect(() => {
    if (query.error) {
      if (
        isAxiosError(query.error) &&
        query.error.response?.status === HttpStatusCode.Unauthorized
      ) {
        clearAuth()
        navigate('/log-in')
      }
    }
  }, [clearAuth, navigate, query.error])

  return query
}
