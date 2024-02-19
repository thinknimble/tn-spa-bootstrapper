import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { userApi } from 'src/services/user'
import { AccountForm, AccountFormInputs, TAccountForm } from 'src/services/user/forms'
import { useAuth } from 'src/stores/auth'

function SignUpInner() {
  const [error, setError] = useState('')
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TAccountForm>()
  const navigate = useNavigate()

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: userApi.csc.signup,
    onSuccess: (data) => {
      if (!data.token) throw new Error('Token should be returned on user creation')
      changeToken(data.token)
      changeUserId(data.id)
      navigate('/home')
    },
    onError(e: any) {
      if (e?.message === 'Please enter valid credentials') {
        console.log(e)
      }
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const data = {
      email: form.email.value,
      password: form.password.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
    }
    const input = {
      ...data,
    }
    createUser(input as any)
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-800">
      <header className="text-xl text-white">WELCOME</header>
      <p className="text-md text-white">Enter your details below to create an account</p>
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
        <p className="text-xl font-semibold text-slate-200">Already have an account?</p>
        <Link to="/log-in" className="text-center text-xl font-semibold text-teal-600">
          Log in here
        </Link>
      </div>
    </main>
  )
}
const confirmPasswordValidator = {
  confirmPassword: new MustMatchValidator({
    message: 'passwordsMustMatch',
    matcher: 'password',
  }),
}

export const SignUp = () => {
  return (
    <FormProvider<AccountFormInputs>
      formClass={AccountForm}
      formLevelValidators={confirmPasswordValidator}
    >
      <SignUpInner />
    </FormProvider>
  )
}
