import { Route, Routes, Navigate } from 'react-router-dom'
import { Home, Layout, LogIn, SignUp } from 'src/pages'
import { Dashboard } from 'src/pages/dashboard'
import { ChatDemo } from 'src/pages/chat-demo'
import { PageNotFound } from 'src/pages/page-not-found'
import { RequestPasswordReset } from 'src/pages/request-password-reset'
import { ResetPassword } from 'src/pages/reset-password'
import { useAuth } from 'src/stores/auth'

const PrivateRoutes = () => {
  return (
    <>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<ChatDemo />} />
    </>
  )
}

const AuthRoutes = () => {
  return (
    <>
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/request-reset" element={<RequestPasswordReset />} />
      <Route path="/password/reset/confirm/:userId/:token" element={<ResetPassword />} />
    </>
  )
}

export const AppRoutes = () => {
  const token = useAuth.use.token()
  const isAuth = Boolean(token)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        {isAuth ? PrivateRoutes() : AuthRoutes()}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  )
}
