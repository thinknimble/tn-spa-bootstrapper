import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import {
  ResetPasswordForm,
  ResetPasswordInput,
  TResetPasswordForm,
  resetPassword,
  userApi,
} from 'src/services/user'
import { useAuth } from 'src/stores/auth'
import { useParams } from 'react-router-dom'
import { Logo } from 'src/components/logo'

export const ResetPasswordInner = () => {
  const navigate = useNavigate()
  const { writeUserInStorage } = useAuth.use.actions()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { createFormFieldChangeHandler, form } = useTnForm<TResetPasswordForm>()
  const { email, code } = useParams()

  const { mutate: resetPasswordRequest } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      writeUserInStorage(data)
      setErrorMessage(undefined)
      navigate('/dashboard')
    },
    onError(e: any) {
      const error = e.response.data[0] ?? 'An error occurred. Please try again.'
      setErrorMessage(error)
    },
  })

  const handleRequest = () => {
    const input = {
      email: email ?? '',
      code: code ?? '',
      password: form.password.value ?? '',
    }
    resetPasswordRequest(input)
  }

  useEffect(() => {
    if (code) {
      createFormFieldChangeHandler(form.code)(code)
    }
    if (email) {
      createFormFieldChangeHandler(form.email)(email)
    }

    return () => {}
  }, [code, createFormFieldChangeHandler, email, form.code, form.email, form.password])

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo />
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
          Password Reset
        </h2>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <form>
          <Input
            placeholder="Enter new password..."
            type="text"
            onChange={(e) => {
              createFormFieldChangeHandler(form.password)(e.target.value)
            }}
            value={form.password.value ?? ''}
            id="password"
          />
          <ErrorsList errors={form.password.errors} />
          <Input
            placeholder="Confirm password..."
            type="text"
            onChange={(e) => {
              createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
            }}
            value={form.confirmPassword.value ?? ''}
            id="confirmPassword"
          />
          <ErrorsList errors={form.confirmPassword.errors} />

          <div className="mb-2">
            <ErrorMessage>{errorMessage}</ErrorMessage>
          </div>
          <Button
            onClick={handleRequest}
            disabled={!form.isValid}
            variant={form.isValid ? 'primary' : 'disabled'}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  )
}

export const ResetPassword = () => {
  return (
    <FormProvider<ResetPasswordInput> formClass={ResetPasswordForm}>
      <ResetPasswordInner />
    </FormProvider>
  )
}
