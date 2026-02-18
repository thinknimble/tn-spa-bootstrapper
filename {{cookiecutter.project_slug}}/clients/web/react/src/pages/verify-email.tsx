import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage } from 'src/components/errors'
import { userApi } from 'src/services/user'
import { useAuth } from 'src/stores/auth'

export const VerifyEmail = () => {
  const { userId, token } = useParams()
  const [error, setError] = useState('')
  const { setNeedsEmailVerification } = useAuth.use.actions()
  const authToken = useAuth.use.token()
  const isLoggedIn = Boolean(authToken)

  const { mutate: verifyEmail, isSuccess, isPending } = useMutation({
    mutationFn: userApi.csc.verifyEmail,
    onSuccess: () => {
      // Clear the flag so user can access protected routes after logging in
      setNeedsEmailVerification(false)
    },
    onError: (e) => {
      if (isAxiosError(e) && e.response?.data && 'non-field-error' in e.response.data) {
        setError(e.response.data['non-field-error'])
        return
      }
      setError('There was an error verifying your email. The link may be invalid or expired.')
    },
  })

  useEffect(() => {
    if (userId && token) {
      verifyEmail({ userId, token })
    }
  }, [userId, token, verifyEmail])

  if (isPending) {
    return (
      <AuthLayout title="Verifying your email..." description="Please wait">
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AuthLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email verified!"
        description={isLoggedIn
          ? "Your email has been successfully verified."
          : "Your email has been successfully verified. You can now log in to your account."
        }
      >
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <Link to={isLoggedIn ? "/home" : "/log-in"}>
            <Button variant="primary" className="w-full">
              {isLoggedIn ? "Continue" : "Go to login"}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Verification failed" description="We couldn't verify your email address">
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <Link to={isLoggedIn ? "/home" : "/log-in"} className="mt-4 block">
          <Button variant="primary" className="w-full">
            {isLoggedIn ? "Continue" : "Go to login"}
          </Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
