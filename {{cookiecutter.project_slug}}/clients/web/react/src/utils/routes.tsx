import { Navigate, Route, Routes } from 'react-router-dom'
import { Home, Layout, LogIn, SignUp } from 'src/pages'
import { AppOrAuth } from 'src/pages/app-or-auth'
import { Dashboard } from 'src/pages/dashboard'
import { PageNotFound } from 'src/pages/page-not-found'
import { useAuth } from 'src/stores/auth'

const PrivateRoutes = () => {
  const token = useAuth.use.token()
  const isAuth = Boolean(token)

  return isAuth ? (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/private" element={<div>Hello from private</div>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  ) : (
    <Navigate to="/log-in" />
  )
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AppOrAuth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/*" element={<PrivateRoutes />} />
      </Route>
    </Routes>
  )
}
