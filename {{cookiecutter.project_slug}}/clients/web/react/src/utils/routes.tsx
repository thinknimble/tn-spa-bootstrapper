import { ReactNode } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { CheckEmail, Home, Layout, LogIn, SignUp } from 'src/pages'
import { Dashboard } from 'src/pages/dashboard'
import { ChatDemo } from 'src/pages/chat-demo'
import { PageNotFound } from 'src/pages/page-not-found'
import { RequestPasswordReset } from 'src/pages/request-password-reset'
import { ResetPassword } from 'src/pages/reset-password'
import { VerifyEmail } from 'src/pages/verify-email'
import { useAuth } from 'src/stores/auth'

/**
 * Guard component that redirects to /check-email if user needs email verification
 */
const RequireVerifiedEmail = ({ children }: { children: ReactNode }) => {
  const needsEmailVerification = useAuth.use.needsEmailVerification()
  if (needsEmailVerification) {
    return <Navigate to="/check-email" replace />
  }
  return <>{children}</>
}

const PrivateRoutes = () => {
  return (
    <>
      <Route path="/dashboard" element={<RequireVerifiedEmail><Dashboard /></RequireVerifiedEmail>} />
      <Route path="/chat" element={<RequireVerifiedEmail><ChatDemo /></RequireVerifiedEmail>} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/verify-email/:userId/:token" element={<VerifyEmail />} />
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
