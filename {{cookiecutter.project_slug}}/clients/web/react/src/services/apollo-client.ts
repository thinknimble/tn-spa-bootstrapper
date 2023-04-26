import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createHttpLink } from '@apollo/client/link/http'
import { setContext } from '@apollo/client/link/context'
import { getCookie } from 'src/utils/get-cookie'

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const csrfToken = getCookie('csrftoken')
  let authToken = localStorage.getItem('auth-token')
  if (authToken === 'null') {
    authToken = null
  }

  // return the headers to the context so httpLink can read them

  const authHeaders: { 'X-CSRFToken'?: string; Authorization?: string } = {
    'X-CSRFToken': csrfToken,
  }

  if (authToken) {
    authHeaders['Authorization'] = 'JWT ' + authToken
  } else if (headers && headers['Authorization']) {
    delete headers['Authorization']
  }

  return {
    headers: {
      ...headers,
      ...authHeaders,
    },
  }
})

// We should change this to follow the rest framework proxying rather than this if statement so it is consistent - PB
const local_backend_uri = `${
  import.meta.env.VITE_DEV_BACKEND_URL
    ? import.meta.env.VITE_DEV_BACKEND_URL
    : 'http://localhost:8000'
}`

const backend_api = import.meta.env.DEV ? local_backend_uri + '/graphql' : '/graphql'

const link = createHttpLink({
  uri: backend_api,
  credentials: 'include',
})

export const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
  credentials: 'include',
})
