import { BrowserRouter as Router, Outlet } from 'react-router-dom'
{% if cookiecutter.use_graphql == 'y' -%}
import { AuthProvider } from './utils/auth'
{% endif -%}
import { AppRoutes } from './utils/routes'

export const AppRoot = () => {
  return (
    <Router>
      {% if cookiecutter.use_graphql == 'y' -%}
      <AuthProvider>
      {% endif -%}
        <AppRoutes />
      {% if cookiecutter.use_graphql == 'y' -%}
      </AuthProvider>
      {% endif -%}
      <Outlet />
    </Router>
  )
}

export const App = () => {
  return <AppRoot />
}
