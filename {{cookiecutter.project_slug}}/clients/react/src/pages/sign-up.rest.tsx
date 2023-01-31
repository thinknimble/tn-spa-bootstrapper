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
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignupForm, TSignupForm } from 'src/forms'
import { SignupInputs } from 'src/forms/signup'
import { postCreateUser, postLogin } from 'src/services/auth'
import { useAuth } from '../utils/auth.rest'

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
