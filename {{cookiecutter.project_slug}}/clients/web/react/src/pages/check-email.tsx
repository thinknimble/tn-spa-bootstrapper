import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage } from 'src/components/errors'
import { axiosInstance } from 'src/services/axios-instance'
import { useAuth } from 'src/stores/auth'

export const CheckEmail = () => {
  const token = useAuth.use.token()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { mutate: resendEmail, isPending } = useMutation({
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
          <Button onClick={() => resendEmail()} isLoading={isPending} disabled={isPending}>
            Resend Verification Email
          </Button>
        </div>

        {successMessage && (
          <p className="text-center text-sm text-green-600">{successMessage}</p>
        )}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <div className="mt-4 text-center text-sm">
          <Link to="/log-in" className="font-semibold text-primary hover:underline">
            Back to Log In
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
