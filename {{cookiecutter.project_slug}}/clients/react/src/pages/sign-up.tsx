import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { SignupForm, TSignupForm } from 'src/forms'
import { SignupInputs } from 'src/forms/signup'
import { postCreateUser, postLogin } from 'src/services/auth'
import { localStoreManager } from 'src/utils/local-store-manager'
import { useAuth } from '../utils/auth'

function SignUpInner() {
  const [error, setError] = useState('')
  const { updateToken } = useAuth()
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TSignupForm>()
  const navigate = useNavigate()

  const { mutate: logIn } = useMutation(postLogin, {
    onSuccess: (data: { tokenAuth: { token: string } }) => {
      localStoreManager.token.set(data.tokenAuth.token)
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

  const onSubmit = () => {
    createUser({
      email: form.email.value ?? '',
      password: form.password.value ?? '',
      firstName: form.firstName.value ?? '',
      lastName: form.lastName.value ?? '',
    })
  }

  return (
    <main className="bg-slate-800 h-screen flex flex-col justify-center items-center gap-3">
      <header className="text-white text-xl">WELCOME</header>
      <p className="text-white text-md">Enter your details below to create an account</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div>
            <Input
              placeholder="First Name"
              onChange={(e) => {
                createFormFieldChangeHandler(form.firstName)(e.target.value)
              }}
            />
            <ErrorsList errors={form.firstName.errors} />
          </div>
          <div>
            <Input
              placeholder="Last Name"
              onChange={(e) => {
                createFormFieldChangeHandler(form.lastName)(e.target.value)
              }}
            />

            <ErrorsList errors={form.lastName.errors} />
          </div>
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => {
              createFormFieldChangeHandler(form.email)(e.target.value)
            }}
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
          />
          <ErrorsList errors={form.password.errors} />
        </div>
        <div>
          <Input
            id="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            onChange={(e) => {
              createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
            }}
          />
          <ErrorsList errors={form.confirmPassword.errors} />
        </div>
        <Button type="submit">Sign Up</Button>
      </form>

      <div className="flex flex-col gap-3">
        <p className="text-xl text-slate-200 font-semibold">Already have an account?</p>
        <Link to="/log-in" className="text-xl text-teal-600 font-semibold text-center">
          Log in here
        </Link>
      </div>
    </main>
  )
}

export const SignUp = () => {
  return (
    <FormProvider<SignupInputs> formClass={SignupForm}>
      <SignUpInner />
    </FormProvider>
  )
}
