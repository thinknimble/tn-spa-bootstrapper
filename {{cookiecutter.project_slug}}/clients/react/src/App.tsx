import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Outlet } from "react-router-dom"
import theme from "./theme"
import { AuthProvider } from "./utils/auth"
import { ROUTES } from "./utils/routes"

export const App = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <AuthProvider>{ROUTES}</AuthProvider>
      <Outlet />
    </Router>
  </ChakraProvider>
)
