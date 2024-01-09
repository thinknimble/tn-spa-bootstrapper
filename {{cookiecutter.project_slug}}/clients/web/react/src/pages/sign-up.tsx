import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { AccountForm, TAccountForm, AccountFormInputs } from 'src/services/user/forms'
import { User, userApi } from 'src/services/user'
import { useAuth } from 'src/stores/auth'
import { Logo } from 'src/components/logo'

function SignUpInner() {
  const [error, setError] = useState('')
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TAccountForm>()
  const navigate = useNavigate()

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: userApi.create,
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
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-10 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo />
        <h2 className="text-primary mt-4 text-center text-2xl font-bold leading-9 tracking-tight">
          Sign up
        </h2>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <div>
              <Input
                placeholder="Enter first name..."
                onChange={(e) => {
                  createFormFieldChangeHandler(form.firstName)(e.target.value)
                }}
                label="First Name"
              />
              <ErrorsList errors={form.firstName.errors} />
            </div>
            <div>
              <Input
                placeholder="Enter last name..."
                onChange={(e) => {
                  createFormFieldChangeHandler(form.lastName)(e.target.value)
                }}
                label="Last Name"
              />

              <ErrorsList errors={form.lastName.errors} />
            </div>
          </div>
          <div>
            <Input
              type="email"
              placeholder="Enter email..."
              onChange={(e) => {
                createFormFieldChangeHandler(form.email)(e.target.value)
              }}
              label="Email"
            />
            <ErrorsList errors={form.email.errors} />
          </div>

          <div>
            <Input
              placeholder="Enter password..."
              type="password"
              onChange={(e) => {
                createFormFieldChangeHandler(form.password)(e.target.value)
              }}
              label="Password"
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
              label="Confirm Password"
            />
            <ErrorsList errors={form.confirmPassword.errors} />
          </div>
          <Button type="submit">Sign Up</Button>
        </form>
      </div>
      <div className="m-4 flex self-center text-sm">
        <p className="mr-2">Already have an account?</p>

        <Link to="/log-in" className="text-primary font-bold hover:underline">
          Log in.
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
