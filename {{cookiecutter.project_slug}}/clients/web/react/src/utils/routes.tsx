import { Route, Routes, Navigate } from 'react-router-dom'
import { CheckEmail, Home, Layout, LogIn, SignUp } from 'src/pages'
import { Dashboard } from 'src/pages/dashboard'
import { ChatDemo } from 'src/pages/chat-demo'
import { PageNotFound } from 'src/pages/page-not-found'
import { RequestPasswordReset } from 'src/pages/request-password-reset'
import { ResetPassword } from 'src/pages/reset-password'
import { VerifyEmail } from 'src/pages/verify-email'
import { useAuth } from 'src/stores/auth'

const PrivateRoutes = () => {
  return (
    <>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<ChatDemo />} />
      <Route path="/check-email" element={<CheckEmail />} />
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
      <Route path="/verify-email/:userId/:token" element={<VerifyEmail />} />
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
