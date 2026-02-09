import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage } from 'src/components/errors'
import { axiosInstance } from 'src/services/axios-instance'
import { userApi } from 'src/services/user'
import { useAuth } from 'src/stores/auth'

export const CheckEmail = () => {
  const token = useAuth.use.token()
  const { clearAuth } = useAuth.use.actions()
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post('/resend-verification-email/')
      return res.data
    },
    onSuccess: () => {
      setSuccessMessage('Verification email sent! Please check your inbox.')
      setErrorMessage(null)
    },
    onError: (e: any) => {
      const message = e.response?.data?.['non-field-error'] || 'Failed to resend email'
      setErrorMessage(message)
      setSuccessMessage(null)
    },
  })

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: userApi.csc.logout,
    onSettled: () => {
      clearAuth()
      navigate('/log-in')
    },
  })

  if (!token) {
    return <Navigate to="/log-in" />
  }

  return (
    <AuthLayout title="Check Your Email">
      <div className="mt-6 flex flex-col items-center gap-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <p className="text-lg text-gray-700">
            We&apos;ve sent a verification link to your email address.
          </p>
          <p className="mt-2 text-gray-600">
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">Didn&apos;t receive the email?</p>
          <Button onClick={() => resendEmail()} isLoading={isResending} disabled={isResending}>
            Resend Verification Email
          </Button>
        </div>

        {successMessage && (
          <p className="text-center text-sm text-green-600">{successMessage}</p>
        )}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="font-semibold text-primary hover:underline"
          >
            {isLoggingOut ? 'Logging out...' : 'Use a different account'}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
