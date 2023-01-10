import { useMutation } from '@apollo/client'
import {
  Box,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Input,
  Link,
  Text,
} from '@chakra-ui/react'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignupForm, TSignupForm } from 'src/forms'
import { SignupInputs } from 'src/forms/signup'
import { AuthContext } from '../utils/auth'
import { CREATE_USER, LOG_IN } from '../utils/mutations'

export function SignUpInner() {
  const [error, setError] = useState('')
  const { updateToken } = useContext(AuthContext)
  const { form, createFormFieldChangeHandler, validate } = useTnForm<TSignupForm>()
  const navigate = useNavigate()

  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: { tokenAuth: { token: string } }) => {
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
      if (error.message.includes('value too long')) {
        //TODO: what is this?? there's no phone in this form
        setError('phone')
      } else {
        console.error(error)
      }
    },
  })

  const handleSignup = () => {
    createUser({
      variables: {
        data: {
          email: form.email.value,
          password: form.password.value,
          firstName: form.firstName.value,
          lastName: form.lastName.value,
        },
      },
    })
  }

  return (
    <Box maxWidth={'700px'} mt={10} mx={{ base: 5, md: 80 }}>
      <Heading>WELCOME</Heading>
      <Text my={5}>Enter your details below to create an account</Text>
      <form onSubmit={handleSignup}>
        <HStack justify={'space-between'} mb={5}>
          <Input
            isRequired={true}
            placeholder="First Name"
            value={form.firstName.value ?? ''}
            onChange={(e) => {
              createFormFieldChangeHandler(form.firstName)(e.target.value)
            }}
          />
          <Input
            isRequired={true}
            placeholder="Last Name"
            onChange={(e) => {
              createFormFieldChangeHandler(form.lastName)(e.target.value)
            }}
          />
        </HStack>
        <FormControl isInvalid={error === 'email'}>
          <Input
            mb={error === 'email' ? 2 : 5}
            type="email"
            isRequired={true}
            placeholder="Email"
            value={form.email.value ?? ''}
            onChange={(e) => {
              createFormFieldChangeHandler(form.email)(e.target.value)
            }}
          />
        </FormControl>

        <FormControl isInvalid={Boolean(form.confirmPassword.errors?.length)}>
          <Input
            isRequired={true}
            placeholder="Password"
            type="password"
            mb={5}
            value={form.password.value ?? ''}
            onChange={(e) => {
              createFormFieldChangeHandler(form.password)(e.target.value)
              validate()
            }}
          />
          <Input
            isRequired={true}
            id="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            onChange={(e) => {
              createFormFieldChangeHandler(form.confirmPassword)(e.target.value)
              validate()
            }}
          />
          <FormErrorMessage>Passwords do not match</FormErrorMessage>
        </FormControl>
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

      <Text mt={10} fontSize="14px" textAlign={'center'}>
        Already have an account?{' '}
        <Link fontWeight="bold" textDecor={'underline'} href="/log-in">
          Log in here
        </Link>
      </Text>
    </Box>
  )
}

export const SignUp = () => {
  return (
    <FormProvider<SignupInputs> formClass={SignupForm}>
      <SignUpInner />
    </FormProvider>
  )
}
