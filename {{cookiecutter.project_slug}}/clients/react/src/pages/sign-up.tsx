import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { SignupForm, TSignupForm } from 'src/forms'
import { SignupInputs } from 'src/forms/signup'
import { postCreateUser, postLogin } from 'src/services/auth'
import { useAuth } from '../utils/auth'

export function SignUpInner() {
  const [error, setError] = useState('')
  const { updateToken } = useAuth()
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TSignupForm>()
  const navigate = useNavigate()

  const { mutate: logIn } = useMutation(postLogin, {
    onSuccess: (data: { tokenAuth: { token: string } }) => {
      localStorage.setItem('auth-token', data.tokenAuth.token)
      updateToken(data.tokenAuth.token)
      navigate('/home')
    },
    onError: () => {
      navigate('/log-in', {
        state: {
          autoError: 'There was a problem logging you in. Please try again.',
        },
      })
    },
  })

  const { mutate: createUser } = useMutation(postCreateUser, {
    onSuccess: (data) => {
      logIn({
        email: form.email.value ?? '',
        password: form.confirmPassword.value ?? '',
      })
    },
    onError: (error: { message: string }) => {
      console.error(error)
    },
  })

  const handleSignup = () => {
    createUser({
      email: form.email.value ?? '',
      password: form.password.value ?? '',
      firstName: form.firstName.value ?? '',
      lastName: form.lastName.value ?? '',
    })
  }

  return (
    <div>
      <header>WELCOME</header>
      <p>Enter your details below to create an account</p>
      <form onSubmit={handleSignup}>
        <div>
          <input
            placeholder="First Name"
            value={form.firstName.value}
            onChange={(e) => createFormFieldChangeHandler(form.firstName)(e.target.value)}
          />
          <input
            placeholder="Last Name"
            value={form.lastName.value}
            onChange={(e) => {
              createFormFieldChangeHandler(form.lastName)(e.target.value)
            }}
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={form.email.value}
          onChange={(e) => {
            createFormFieldChangeHandler(form.email)(e.target.value)
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password.value}
          onChange={(e) => {
            createFormFieldChangeHandler(form.password)(e.target.value)
          }}
        />
        <input
          id="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword.value}
          onChange={(e) => {
            createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
          }}
        />
        <button
          style={{
            padding: '5px',
            marginTop: '20px',
            borderRadius: '5px',
            width: '100%',
            fontWeight: 'bold',
            background: '#6683A9',
            color: 'white',
          }}
          type="submit"
        >
          Sign Up
        </button>
      </form>

      <p>
        Already have an account? <Link to="/log-in">Log in here</Link>
      </p>
    </div>
  )
}

export const SignUp = () => {
  return (
    <FormProvider<SignupInputs> formClass={SignupForm}>
      <SignUpInner />
    </FormProvider>
  )
}
