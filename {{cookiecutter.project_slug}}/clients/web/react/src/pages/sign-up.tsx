{% if cookiecutter.use_graphql == 'y' -%}
import { useMutation } from '@apollo/client'
import { CREATE_USER, LOG_IN } from '../utils/mutations'
{% else -%}
import { useMutation } from '@tanstack/react-query'
{% endif -%}
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { MustMatchValidator } from '@thinknimble/tn-forms'
import { FormEvent ,useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/button'
import { ErrorsList } from 'src/components/errors'
import { Input } from 'src/components/input'
import {
  AccountForm,
  TAccountForm,
  AccountFormInputs,
} from 'src/services/user/forms'
{% if cookiecutter.use_graphql=='n' -%}
import { User, userApi } from 'src/services/user/index'
{% endif -%}
import { useAuth } from 'src/stores/auth'

function SignUpInner() {
  const [error, setError] = useState('')
  const { changeToken, changeUserId } = useAuth.use.actions()
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TAccountForm>()
  const navigate = useNavigate()

{% if cookiecutter.use_graphql == 'y' -%}
  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: { tokenAuth: { token: string } }) => {
      changeToken(data.tokenAuth.token)
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
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data: {
      createUser: {
        user: {
          email: string
        }
      }
    }) => {
      logIn({
        variables: {
          email: data.createUser.user.email,
          password: form.confirmPassword.value,
        },
      })
    },
    onError: (error: { message: string }) => {
        console.error(error)
    },
  })
{% else -%}
const { mutate: createUser, isLoading } = useMutation({
  mutationFn: userApi.create,
  onSuccess: (data) => {
    if(!data.token) throw new Error('Token should be returned on user creation')
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
{% endif -%}

  const onSubmit = (e:FormEvent) => {
    e.preventDefault()
    const data = {
      email: form.email.value,
      password: form.password.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
    }
{% if cookiecutter.use_graphql == 'y' -%}
    const input ={
      variables: {
        data
      },
    } 
{% else -%}
    const input = {
      ...data
    }
{% endif -%}
    createUser(input as any)
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
const confirmPasswordValidator = {
  confirmPassword: new MustMatchValidator({
    message: 'passwordsMustMatch',
    matcher: 'password',
  }),
}

export const SignUp = () => {
  return (
    <FormProvider<AccountFormInputs> formClass={AccountForm} formLevelValidators={confirmPasswordValidator}>
      <SignUpInner />
    </FormProvider>
  )
}
