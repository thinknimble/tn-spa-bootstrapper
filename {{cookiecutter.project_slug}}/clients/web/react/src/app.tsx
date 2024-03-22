import { BrowserRouter as Router, Outlet } from 'react-router-dom'
import { AppRoutes } from './utils/routes'

export const AppRoot = () => {
  return (
    <Router>
      <AppRoutes />
      <Outlet />
    </Router>
  )
}

export const App = () => {
  return <AppRoot />
}
