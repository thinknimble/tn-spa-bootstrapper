import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { LoginForm, LoginFormInputs, TLoginForm, userApi } from 'src/services/user'

import { AuthLayout } from 'src/components/auth-layout'
import { PasswordInput } from 'src/components/password-input'
import { useAuth } from 'src/stores/auth'
import { useFollowupRoute } from 'src/utils/auth'
import { getErrorMessages } from 'src/utils/errors'

function LogInInner() {
  const [errorMessage, setErrorMessage] = useState<string[] | undefined>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()
  const navigate = useNavigate()

  const { mutate: logIn, isPending } = useMutation({
    mutationFn: userApi.csc.login,
    onSuccess: (data) => {
      changeToken(data.token)
      changeUserId(data.id)
      navigate('/dashboard')
    },
    onError(e: any) {
      const errors = getErrorMessages(e)
      setErrorMessage(errors)
    },
  })

  const handleLogin = () => {
    const input = {
      email: form.email.value ?? '',
      password: form.password.value ?? '',
    }
    logIn(input)
  }

  const token = useAuth.use.token()
  const isAuth = Boolean(token)
  const followupRoute = useFollowupRoute()
  if (isAuth) {
    const state = {from: followupRoute}
    return <Navigate to={'/'} state={state} />
  }

  return (
    <AuthLayout title="Log In">
      <section className="mt-6 flex flex-col gap-3 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="flex flex-col gap-3"
        >
          <div>
            <Input
              placeholder="Enter email..."
              onChange={(e) => createFormFieldChangeHandler(form.email)(e.target.value)}
              value={form.email.value ?? ''}
              data-testid="email"
              id="id"
              label="Email address"
            />
            <ErrorsList errors={form.email.errors} />
          </div>
          <div>
            <div className="mt-2">
              <div className="flex w-full items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-primary">Password</label>
                <div className="text-sm hover:underline">
                  <Link to="/request-reset">
                    <p className="font-semibold text-accent">Forgot password?</p>
                  </Link>
                </div>
              </div>
              <PasswordInput
                placeholder="Enter password..."
                onChange={(e) => {
                  createFormFieldChangeHandler(form.password)(e.target.value)
                }}
                value={form.password.value ?? ''}
                data-testid="password"
                id="password"
              />
              <ErrorsList errors={form.password.errors} />
            </div>
          </div>
        </form>

        <div className="mb-2">
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
        <Button
          data-testid="submit"
          onClick={handleLogin}
          variant="primary"
          disabled={isPending || !form.isValid}
        >
          Log in
        </Button>
      </section>

      <div className="m-4 flex self-center text-sm">
        <p className="mr-2">Don&apos;t have an account?</p>
        <Link className="font-bold text-primary hover:underline" to="/sign-up">
          Sign up.
        </Link>
      </div>
    </AuthLayout>
  )
}

export const LogIn = () => {
  return (
    <FormProvider<LoginFormInputs> formClass={LoginForm}>
      <LogInInner />
    </FormProvider>
  )
}
