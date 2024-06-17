import { Navigate, Route, Routes } from 'react-router-dom'
import { Home, LogIn, SignUp } from 'src/pages'
import { ForgotPassword } from 'src/pages/forgot-password'
import { ResetPassword } from 'src/pages/reset-password'
import { useAuth } from 'src/stores/auth'

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/private" element={<div>Hello from private</div>} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  )
}

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/*">
        <Route path="log-in" element={<LogIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="password/reset/confirm/:userId/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/log-in" />} />
      </Route>
    </Routes>
  )
}

export const AppRoutes = () => {
  const token = useAuth.use.token()
  const isAuth = Boolean(token)

  if (!isAuth) return <AuthRoutes />
  return <PrivateRoutes />
}
