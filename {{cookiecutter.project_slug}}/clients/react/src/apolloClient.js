import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { createHttpLink } from '@apollo/client/link/http'
import { setContext } from '@apollo/client/link/context'
import getCookie from "./utils/getCookie";


const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const csrfToken = getCookie("csrftoken");
  let authToken = localStorage.getItem("auth-token");
  if (authToken === "null") { authToken = null }

  // return the headers to the context so httpLink can read them

  const authHeaders = {
    "X-CSRFToken": csrfToken,
  }

  if (authToken) {
    authHeaders["Authorization"] = ("JWT " + authToken)
  } else if (headers && headers["Authorization"]) {
    delete headers["Authorization"]
  }

  return {
    headers: {
      ...headers,
      ...authHeaders
    }
  };
});

const link = createHttpLink({
  uri: process.env.NODE_ENV === "production" ? "/graphql" : process.env.REACT_APP_DEV_BACKEND_URL + "/graphql",
  credentials: "include"
});

export const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
  credentials: "include"
});
