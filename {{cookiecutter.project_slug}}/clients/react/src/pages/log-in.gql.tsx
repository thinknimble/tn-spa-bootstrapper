import React, { useState, useContext } from 'react'
import {
  Heading,
  Input,
  Text,
  Grid,
  GridItem,
  Button,
  VStack,
  Link,
  Image,
  Show,
  Hide,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { LOG_IN } from '../utils/mutations'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from 'src/assets/images/logo.svg'
import { LoginForm, TLoginForm } from 'src/forms'
import { LoginFormInputs } from 'src/forms/login'
import { FormProvider, useTnForm } from '@thinknimble/tn-forms-react'
import { useAuth } from 'src/utils/auth.gql'

export function LogInInner() {
  const params = useLocation()
  const autoError = params.state?.autoError
  const [error, setError] = useState(autoError ? true : false)

  const { updateToken } = useAuth()
  const { createFormFieldChangeHandler, form } = useTnForm<TLoginForm>()

  const navigate = useNavigate()
  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: { tokenAuth: { token: string } }) => {
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
      variables: {
        email: form.email.value,
        password: form.password.value,
      },
    })
  }

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        md: '1fr 350px 350px 1fr',
      }}
      templateRows={{ base: 'repeat(2, 2fr)' }}
    >
      <GridItem colStart={2} colEnd={3}>
        <VStack
          justify="center"
          align="center"
          h={{ base: '80vh', md: '50vh' }}
          mx={5}
          mt={{ base: 0, md: '30%' }}
        >
          <Show breakpoint="(max-width: 48em)">
            <Image maxW={20} src={Logo} />
          </Show>
          <Heading mt={5}>PORTAL LOG IN</Heading>
          <Text>Enter your login credentials below</Text>
          <FormControl isInvalid={error}>
            <Input
              placeholder="Email"
              onChange={(e) => {
                createFormFieldChangeHandler(form.email)(e.target.value)
              }}
              my={5}
              value={form.email.value ?? ''}
              data-cy="email"
              id="id"
            />
            <Input
              mb={error ? 2 : 5}
              placeholder="Password"
              type="password"
              onChange={(e) => {
                createFormFieldChangeHandler(form.password)(e.target.value)
              }}
              value={form.password.value ?? ''}
              data-cy="password"
              id="password"
            />
            {error ? (
              <FormErrorMessage mb={5}>
                {autoError ? autoError : 'Incorrect email and/or password'}
              </FormErrorMessage>
            ) : (
              <></>
            )}
          </FormControl>
          <Button data-cy="submit" onClick={handleLogin}>
            Sign In
          </Button>
        </VStack>
      </GridItem>
      <GridItem>
        {' '}
        <Hide breakpoint="(max-width: 48em)">
          <VStack
            justify="center"
            align="start"
            h={{ base: '80vh', md: '50vh' }}
            mx={5}
            mt={{ base: 0, md: '30%' }}
          >
            <Image src={Logo} />
          </VStack>
        </Hide>
      </GridItem>
      <GridItem rowStart={2} colStart={2} colEnd={4}>
        <Text mt={5} fontSize="14px" textAlign={'center'}>
          Don&apos;t have an account?{' '}
          <Link fontWeight="bold" textDecor={'underline'} href="/sign-up">
            Sign up here
          </Link>
        </Text>
      </GridItem>
    </Grid>
  )
}

export const LogIn = () => {
  return (
    <FormProvider<LoginFormInputs> formClass={LoginForm}>
      <LogInInner />
    </FormProvider>
  )
}
