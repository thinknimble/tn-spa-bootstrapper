import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { AccountForm, TAccountForm, AccountFormInputs } from 'src/services/user/forms'
import { userApi } from 'src/services/user'
import { useAuth } from 'src/stores/auth'
import { Logo } from 'src/components/logo'
import { PasswordInput } from 'src/components/password-input'

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
      setError('Something went wrong, please try again later.')
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
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
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

          <PasswordInput
            placeholder="Enter password..."
            onChange={(e) => {
              createFormFieldChangeHandler(form.password)(e.target.value)
            }}
            label="Password"
          />
          <ErrorsList errors={form.password.errors} />
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm Password"
            onChange={(e) => {
              createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
            }}
            label="Confirm Password"
          />
          <ErrorsList errors={form.confirmPassword.errors} />
          <Button type="submit" isLoading={isPending} disabled={isPending || !form.isValid}>
            Sign Up
          </Button>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </form>
      </div>
      <div className="m-4 flex self-center text-sm">
        <p className="mr-2">Already have an account?</p>

        <Link to="/log-in" className="font-bold text-primary hover:underline">
          Log in.
        </Link>
      </div>
    </main>
  )
}
const confirmPasswordValidator = {
  confirmPassword: new MustMatchValidator({
    message: 'Passwords must match',
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
