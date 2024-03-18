import { queryOptions } from '@tanstack/react-query'
import { userApi } from './api'

/**
 * @link https://tkdodo.eu/blog/the-query-options-api?ck_subscriber_id=1819338276
 * Create query factories for a more type safe solution of the queries across the app. This way whichever invalidation that has to happen in the resource can be done with `queryClient.invalidateQueries(userQueries.all())` or any other of the query factory's functions.
 * In this case we do have a very simple example for the user query but depending on the resource we may want to add more query factories
 */

export const userQueries = {
  all: () => ['users'],
  retrieve: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all(), id],
      queryFn: () => userApi.retrieve(id),
      enabled: Boolean(id),
    }),
}
