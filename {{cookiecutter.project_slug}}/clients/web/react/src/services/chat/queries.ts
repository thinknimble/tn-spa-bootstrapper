import { queryOptions } from '@tanstack/react-query'
import { chatApi } from './api'

export const chatQueries = {
  all: () => ['chat'],
  retrieve: (id: string) =>
    queryOptions({
      queryKey: [...chatQueries.all(), id],
      queryFn: () => chatApi.retrieve(id),
      enabled: Boolean(id),
    }),
  list: () =>
    queryOptions({
      queryKey: chatQueries.all(),
      queryFn: () => chatApi.list(),
      enabled: true,
    }),
}
