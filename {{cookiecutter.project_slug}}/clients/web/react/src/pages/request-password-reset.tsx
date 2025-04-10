import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import {
  EmailForgotPasswordForm,
  EmailForgotPasswordInput,
  TEmailForgotPasswordForm,
  userApi,
} from 'src/services/user'
import { getErrorMessages } from 'src/utils/errors'

export const RequestPasswordResetInner = () => {
  const [errorMessage, setErrorMessage] = useState<string[] | undefined>()
  const [resetLinkSent, setResetLinkSent] = useState(false)
  const { createFormFieldChangeHandler, form } = useTnForm<TEmailForgotPasswordForm>()
  const navigate = useNavigate()

  const { mutate: requestReset } = useMutation({
    mutationFn: userApi.csc.requestPasswordReset,
    onSuccess: () => {
      setErrorMessage(undefined)
      setResetLinkSent(true)
    },
    onError(e: any) {
      const errors = getErrorMessages(e)
      setErrorMessage(errors)
    },
  })

  const handleRequest = () => {
    const input = {
      email: form.email.value ?? '',
    }
    requestReset(input)
  }

  return (
    <AuthLayout title="Request Password Reset">
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
              className="flex flex-col gap-2"
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
              <Button onClick={handleRequest} disabled={!form.isValid} variant={'primary'}>
                Request Password Reset
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export const RequestPasswordReset = () => {
  return (
    <FormProvider<EmailForgotPasswordInput> formClass={EmailForgotPasswordForm}>
      <RequestPasswordResetInner />
    </FormProvider>
  )
}
