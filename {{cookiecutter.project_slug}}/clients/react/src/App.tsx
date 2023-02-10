import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme'
import { Outlet, BrowserRouter as Router } from 'react-router-dom'
import { ROUTES } from './utils/routes'
import { AuthProvider } from './utils/auth'

export const App = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <AuthProvider>{ROUTES}</AuthProvider>
      <Outlet />
    </Router>
  </ChakraProvider>
)
