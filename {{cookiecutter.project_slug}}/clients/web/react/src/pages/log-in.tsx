import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { LoginForm, TLoginForm, LoginFormInputs, userApi } from 'src/services/user'

import { useFollowupRoute } from 'src/utils/auth'
import { useAuth } from 'src/stores/auth'
import { Logo } from 'src/components/logo'

function LogInInner() {
  const params = useLocation()
  const autoError = params.state?.autoError
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()
  const navigate = useNavigate()

  const { mutate: logIn } = useMutation({
    mutationFn: userApi.csc.login,
    onSuccess: (data) => {
      changeToken(data.token)
      changeUserId(data.id)
      navigate('/home')
    },
    onError(e: any) {
      const error = e.response.data[0] ?? 'An error occurred. Please try again.'
      setErrorMessage(error)
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
    return <Navigate to={'/'} state={{'{{'}} from: followupRoute {{ '}}' }} />
  }

  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo />
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
          Log in
        </h2>
      </div>

      <section className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
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
              data-cy="email"
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
              <Input
                placeholder="Enter password..."
                type="password"
                onChange={(e) => {
                  createFormFieldChangeHandler(form.password)(e.target.value)
                }}
                value={form.password.value ?? ''}
                data-cy="password"
                id="password"
              />
              <ErrorsList errors={form.password.errors} />
            </div>
          </div>
        </form>

        <div className="mb-2">
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
        <Button data-cy="login-btn" onClick={handleLogin} variant="primary">
          Log in
        </Button>
      </section>

      <div className="m-4 flex self-center text-sm">
        <p className="mr-2">Don&apos;t have an account?</p>
        <Link className="font-bold text-primary hover:underline" to="/sign-up">
          Sign up.
        </Link>
      </div>
    </main>
  )
}

export const LogIn = () => {
  return (
    <FormProvider<LoginFormInputs> formClass={LoginForm}>
      <LogInInner />
    </FormProvider>
  )
}
