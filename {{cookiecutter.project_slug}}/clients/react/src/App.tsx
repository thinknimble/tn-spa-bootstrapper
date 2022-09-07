import React from "react"
import "./App.css"
import { ROUTES } from "src/utils/routes"
import { AuthProvider } from "src/utils/auth"
import { Outlet, BrowserRouter as Router } from "react-router-dom"
import { useQuery, ApolloProvider } from "@apollo/client"
import { client } from "./apolloClient"

// function App() {
//   return (
//     <h1 className="text-3xl font-bold underline text-red-600">
//       Simple React Typescript Tailwind Sample
//     </h1>
//   )
// }

// export default App

export const App = () => (
  <>
    <Router>
      <ApolloProvider client={client}>
        <AuthProvider>{ROUTES}</AuthProvider>
        <Outlet />
      </ApolloProvider>
    </Router>
  </>
)
