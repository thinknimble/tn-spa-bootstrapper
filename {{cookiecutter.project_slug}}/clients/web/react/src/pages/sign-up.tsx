import { useMutation } from '@tanstack/react-query'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { isAxiosError } from 'axios'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from 'src/components/auth-layout'
import { Button } from 'src/components/button'
import { ErrorMessage, ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import { PasswordInput } from 'src/components/password-input'
import { userApi } from 'src/services/user'
import { AccountForm, AccountFormInputs, TAccountForm } from 'src/services/user/forms'
import { useAuth } from 'src/stores/auth'
import { GENERIC_REQUEST_ERROR } from 'src/utils/constants'

function SignUpInner() {
  const [errors, setErrors] = useState<string[]>([])
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { form, createFormFieldChangeHandler } = useTnForm<TAccountForm>()
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
      console.error(e)
      if (isAxiosError(e)) {
        if (e.response?.data && typeof e.response.data === 'object') {
          setErrors(Object.values(e.response.data))
          return
        }
        if (e.message) {
          setErrors([e.message])
        } else {
          setErrors([GENERIC_REQUEST_ERROR])
        }
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
    <AuthLayout title="Sign Up">
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
                data-testid="first-name"
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
                data-testid="last-name"
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
              data-testid="email"
            />
            <ErrorsList errors={form.email.errors} />
          </div>

          <PasswordInput
            placeholder="Enter password..."
            onChange={(e) => {
              createFormFieldChangeHandler(form.password)(e.target.value)
            }}
            label="Password"
            data-testid="password"
          />
          <ErrorsList errors={form.password.errors} />
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm Password"
            onChange={(e) => {
              createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
            }}
            label="Confirm Password"
            data-testid="confirm-password"
          />
          <ErrorsList errors={form.confirmPassword.errors} />
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending || !form.isValid}
            data-testid="submit"
          >
            Sign Up
          </Button>
          {errors.length
            ? errors.map((e, idx) => <ErrorMessage key={idx}>{e}</ErrorMessage>)
            : null}
        </form>
      </div>
      <div className="m-4 flex self-center text-sm">
        <p className="mr-2">Already have an account?</p>

        <Link to="/log-in" className="font-bold text-primary hover:underline">
          Log in.
        </Link>
      </div>
    </AuthLayout>
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
