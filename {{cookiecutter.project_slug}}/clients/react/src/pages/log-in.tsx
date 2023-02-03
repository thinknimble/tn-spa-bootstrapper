import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm, TLoginForm } from 'src/forms'
import { LoginFormInputs } from 'src/forms/login'
import { postLogin } from 'src/services/auth'
import { useAuth } from 'src/utils/auth'

export function LogInInner() {
  const params = useLocation()
  const autoError = params.state?.autoError
  const [error, setError] = useState(autoError ? true : false)

  const { updateToken } = useAuth()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()

  const navigate = useNavigate()
  const { mutate: logIn } = useMutation(postLogin, {
    onSuccess: (data: { tokenAuth: { token: string } }) => {
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

  const handleLogin = () => {
    logIn({
      email: form.email.value ?? '',
      password: form.password.value ?? '',
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <header style={{ margin: 5 }}>PORTAL LOG IN</header>
        <p>Enter your login credentials below</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            placeholder="Email"
            onChange={(e) => {
              createFormFieldChangeHandler(form.email)(e.target.value)
            }}
            style={{ marginTop: 5 }}
            value={form.email.value}
            data-cy="email"
            id="id"
          />
          <input
            placeholder="Password"
            type="password"
            onChange={(e) => {
              createFormFieldChangeHandler(form.password)(e.target.value)
            }}
            value={form.password.value}
            data-cy="password"
            id="password"
          />
        </form>
        <button onClick={handleLogin}>Sign In</button>
      </div>
      <div>
        <p>
          Don&apos;t have an account? <Link to="/sign-up">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}

export const LogIn = () => {
  return (
    <FormProvider<LoginFormInputs> formClass={LoginForm}>
      <LogInInner />
    </FormProvider>
  )
}
