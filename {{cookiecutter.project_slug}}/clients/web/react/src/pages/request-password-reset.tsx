import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { Logo } from 'src/components/logo'
import {
  EmailForgotPasswordForm,
  EmailForgotPasswordInput,
  TEmailForgotPasswordForm,
  userApi,
} from 'src/services/user'

export const RequestPasswordResetInner = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [resetLinkSent, setResetLinkSent] = useState(false)
  const { createFormFieldChangeHandler, form } = useTnForm<TEmailForgotPasswordForm>()
  const navigate = useNavigate()

  const { mutate: requestReset } = useMutation({
    mutationFn: userApi.csc.requestPasswordReset,
    onSuccess: (data) => {
      setErrorMessage(undefined)
      setResetLinkSent(true)
    },
    onError(e: any) {
      const error = e.response.data[0] ?? 'An error occurred. Please try again.'
      setErrorMessage(error)
    },
  })

  const handleRequest = () => {
    const input = {
      email: form.email.value ?? '',
    }
    requestReset(input)
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo />
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
          Request Password Reset
        </h2>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {resetLinkSent ? (
          <>
            <p className="text-md">
              Your request has been submitted. If there is an account associated with the email
              provided, you should receive an email momentarily with instructions to reset your
              password.
            </p>
            <p className="text-md">
              If you do not see the email in your main folder soon, please make sure to check your
              spam folder.
            </p>
            <div className="pt-6">
              <Button
                onClick={() => {
                  navigate('/log-in')
                }}
                variant="primary"
              >
                Return to Login
              </Button>
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Input
                placeholder="Enter email..."
                onChange={(e) => createFormFieldChangeHandler(form.email)(e.target.value)}
                value={form.email.value ?? ''}
                data-cy="email"
                id="id"
                label="Email address"
              />
              <ErrorsList errors={form.email.errors} />
              <div className="mb-2">
                <ErrorMessage>{errorMessage}</ErrorMessage>
              </div>
              <Button
                onClick={handleRequest}
                disabled={!form.isValid}
                variant={form.isValid ? 'primary' : 'disabled'}
              >
                Request Password Reset
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export const RequestPasswordReset = () => {
  return (
    <FormProvider<EmailForgotPasswordInput> formClass={EmailForgotPasswordForm}>
      <RequestPasswordResetInner />
    </FormProvider>
  )
}
