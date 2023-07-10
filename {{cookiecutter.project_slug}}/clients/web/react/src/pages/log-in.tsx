{% if cookiecutter.use_graphql == 'y' -%}
import { useMutation } from '@apollo/client'
import { LOG_IN } from '../utils/mutations'
{% else -%}
import { useMutation } from '@tanstack/react-query'
{% endif -%}
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { LoginForm, TLoginForm, LoginFormInputs, userApi } from 'src/services/user/index'

import { useAuth, useFollowupRoute } from 'src/utils/auth'
import { localStoreManager } from 'src/utils/local-store-manager'


function LogInInner() {
  const params = useLocation()
  const autoError = params.state?.autoError
  const [error, setError] = useState(autoError ? true : false)
  const { updateToken, updateUserId } = useAuth()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()
  const navigate = useNavigate()

{% if cookiecutter.use_graphql == 'y' -%}
  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: { tokenAuth: { token: string } }) => {
      localStorage.setItem('auth-token', data.tokenAuth.token)
      updateToken(data.tokenAuth.token)

      navigate('/home')
    },
    onError: (error: { message?: string }) => {
      if (error.message === 'Please enter valid credentials') {
        setError(true)
      }
    },
  })
{% else -%}
const { mutate: logIn, isLoading } = useMutation({
  mutationFn: userApi.csc.login,
  onSuccess: (data) => {
    localStoreManager.token.set(data.token!)
    localStoreManager.userId.set(data.id!)
    updateToken(data.token)
    updateUserId(data.id)
    navigate('/home')
  },
  onError(e: any) {
    if (e?.message === 'Please enter valid credentials') {
      setError(true)
    }
  },
})
{% endif -%}

  const handleLogin = () => {
{% if cookiecutter.use_graphql == 'y' -%}
    const input = {
      variables: {
        email: form.email.value,
        password: form.password.value,
      },
    }
{% else -%}
const input = {
  email: form.email.value ?? '',
  password: form.password.value ?? '',
}
{% endif -%}
    logIn(input)
  }

  const { token } = useAuth()
  const isAuth = Boolean(token)
  const followupRoute = useFollowupRoute()
  //Do not even show this page if they're already logged in
  if (isAuth) {
    // let AppOrAuth address this

    return <Navigate to={'/'} state={{'{{'}} from: followupRoute {{ '}}' }} />

  }

  return (
    <main className="bg-slate-800 h-screen flex flex-col justify-center items-center gap-3">
      <header className="text-2xl text-white">Login</header>
      <section className="flex flex-col justify-center items-center gap-3">
        <p className="text-slate-200 text-xl">Enter your login credentials below</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="flex flex-col gap-3"
        >
          <div>
            <Input
              placeholder="Email"
              onChange={(e) => createFormFieldChangeHandler(form.email)(e.target.value)}
              value={form.email.value ?? ''}
              data-cy="email"
              id="id"
            />
            <ErrorsList errors={form.email.errors} />
          </div>
          <div>
            <Input
              placeholder="Password"
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
        </form>
        <Button data-cy="login-btn" onClick={handleLogin}>Login</Button>
      </section>
      <div className="flex flex-col gap-3">
        <p className="text-xl text-slate-200 font-semibold">Don&apos;t have an account?</p>
        <Link className="text-xl text-teal-600 font-semibold text-center" to="/sign-up">
          Register here
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
