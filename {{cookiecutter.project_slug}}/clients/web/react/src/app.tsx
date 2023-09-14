import { BrowserRouter as Router, Outlet } from 'react-router-dom'
{% if cookiecutter.use_graphql == 'y' -%}
import { AuthProvider } from './utils/auth'
{% endif -%}
import { AppRoutes } from './utils/routes'

// comment to trigger the right build
// foobar
// foobar
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
