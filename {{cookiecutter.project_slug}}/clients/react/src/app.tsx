import { BrowserRouter as Router, Outlet } from 'react-router-dom'
import { AuthProvider } from './utils/auth'
import { AppRoutes } from './utils/routes'

export const AppRoot = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Outlet />
    </Router>
  )
}

export const App = () => {
  return <AppRoot />
}
