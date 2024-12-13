import { queryOptions } from '@tanstack/vue-query'
import { userApi } from './api'
import { useAuthStore } from '@/stores/auth'

export const userQueries = {
  all: ['users'],
  retrieve: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all, id],
      queryFn: async () => {
        return userApi.retrieve(id)
      },
      enabled: Boolean(id && useAuthStore().token),
    }),
}
