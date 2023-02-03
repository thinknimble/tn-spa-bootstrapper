import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { LoginForm, TLoginForm } from 'src/forms'
import { LoginFormInputs } from 'src/forms/login'
import { postLogin } from 'src/services/auth'
import { useAuth } from 'src/utils/auth'
import { localStoreManager } from 'src/utils/local-store-manager'

function LogInInner() {
  const params = useLocation()
  const autoError = params.state?.autoError
  const [error, setError] = useState(autoError ? true : false)

  const { updateToken } = useAuth()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()

  const navigate = useNavigate()
  const { mutate: logIn } = useMutation(postLogin, {
    onSuccess: (data: { tokenAuth: { token: string } }) => {
      localStoreManager.token.set(data.tokenAuth.token)
      updateToken(data.tokenAuth.token)

      navigate('/home')
    },
    onError: (error: { message?: string }) => {
      if (error.message === 'Please enter valid credentials') {
        setError(true)
      }
    },
  })

  const handleLogin = () => {
    logIn({
      email: form.email.value ?? '',
      password: form.password.value ?? '',
    })
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
        <Button onClick={handleLogin}>Sign In</Button>
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
