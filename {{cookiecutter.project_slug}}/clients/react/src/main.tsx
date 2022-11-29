import { ColorModeScript } from "@chakra-ui/react"
import * as React from "react"
import {createRoot} from "react-dom/client"
import { App } from "./App"
import { ApolloProvider } from "@apollo/client"
import { client } from "./apolloClient"

const container =   document.getElementById("root")
const root = createRoot(container!)
root.render(
<React.StrictMode>
    <ColorModeScript />
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
