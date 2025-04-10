import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { isAxiosError } from 'axios'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { PasswordInput } from 'src/components/password-input'
import { ResetPasswordForm, TResetPasswordForm, userApi } from 'src/services/user'

export const ResetPasswordInner = () => {
  const { form, createFormFieldChangeHandler, overrideForm } = useTnForm<TResetPasswordForm>()
  const { userId, token } = useParams()
  console.log(userId, token)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { mutate: confirmResetPassword } = useMutation({
    mutationFn: userApi.csc.resetPassword,
    onSuccess: () => {
      setSuccess(true)
    },
    onError: (e) => {
      if (isAxiosError(e) && e.response?.data && 'non-field-error' in e.response.data) {
        setError(e.response.data['non-field-error'])
        return
      }
      setError('There was an error resetting your password. Try again later')
    },
  })

  useEffect(() => {
    if (token && userId) {
      overrideForm(ResetPasswordForm.create({ token: token, uid: userId }) as TResetPasswordForm)
    }
  }, [overrideForm, token, userId])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(form.value)

    if (form.isValid) {
      confirmResetPassword({
        userId: form.value.uid!,
        token: form.value.token!,
        password: form.value.password!,
      })
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Successfully reset password"
        description="You can now log in with your new password"
      >
        <Link to="/log-in" className="mt-3 text-sm font-semibold text-primary hover:underline">
          Go to login
        </Link>
      </AuthLayout>
    )
  }
  return (
    <AuthLayout title="Reset password" description="Choose a new password">
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="flex w-full flex-col gap-3" onSubmit={onSubmit}>
          <section>
            <PasswordInput
              value={form.password.value}
              onChange={(e) => createFormFieldChangeHandler(form.password)(e.target.value)}
              className="w-full"
              placeholder={form.password.placeholder}
              tabIndex={1}
              iconTabIndex={4}
            />
            <ErrorsList errors={form.password.errors} />
          </section>
          <section>
            <PasswordInput
              value={form.confirmPassword.value}
              onChange={(e) => {
                createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
              }}
              className="w-full"
              placeholder={form.confirmPassword.placeholder}
              tabIndex={2}
              iconTabIndex={5}
            />
            <ErrorsList errors={form.confirmPassword.errors} />
          </section>
          <Button variant="primary" type="submit" tabIndex={3}>
            Submit
          </Button>
        </form>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </div>
    </AuthLayout>
  )
}

const formLevelValidators = {
  confirmPassword: new MustMatchValidator({
    message: 'Passwords should match',
    matcher: 'password',
  }),
}

export const ResetPassword = () => {
  return (
    <FormProvider formClass={ResetPasswordForm} formLevelValidators={formLevelValidators}>
      <ResetPasswordInner />
    </FormProvider>
  )
}
