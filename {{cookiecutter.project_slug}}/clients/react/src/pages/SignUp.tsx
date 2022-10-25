import React, { useState, useContext } from "react"
import {
  Heading,
  Input,
  Text,
  FormControl,
  FormErrorMessage,
  Box,
  HStack,
  Link,
} from "@chakra-ui/react"
import { useMutation } from "@apollo/client"
import { CREATE_USER, LOG_IN } from "../utils/mutations"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../utils/auth"

interface FormValues {
  email: string
  password: string
  firstName: string
  lastName: string
}

export default function SignUp() {
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState("")
  const { updateToken } = useContext(AuthContext)

  let navigate = useNavigate()

  const { register, handleSubmit } = useForm<FormValues>()

  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: any) => {
      localStorage.setItem("auth-token", data.tokenAuth.token)
      updateToken(data.tokenAuth.token)
      navigate("/home")
    },
    onError: (error: any) => {},
  })
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data: any) => {
      logIn({
        variables: {
          email: data.createUser.user.email,
          password: confirmPassword,
        },
      })
    },
    onError: (error: any) => {
   if (error.message.includes("value too long")) {
        setError("phone")
      } else {
        console.error(error)
      }
    },
  })

  const handleSignup = handleSubmit((data: FormValues) => {
    if (confirmPassword === data.password) {
      createUser({
        variables: {
          data,
        },
      })
    } else {
      setPasswordMatch(false)
    }
  })

  return (
    <Box maxWidth={"700px"} mt={10} mx={{ base: 5, md: 80 }}>
      <Heading>WELCOME</Heading>
      <Text my={5}>Enter your details below to create an account</Text>
      <form onSubmit={handleSignup}>
        <HStack justify={"space-between"} mb={5}>
          <Input
            isRequired={true}
            placeholder="First Name"
            {...register("firstName", { required: true })}
          />
          <Input
            isRequired={true}
            placeholder="Last Name"
            {...register("lastName", { required: true })}
          />
        </HStack>
        <FormControl isInvalid={error === "email"}>
          <Input
            mb={error === "email" ? 2 : 5}
            type="email"
            isRequired={true}
            placeholder="Email"
            {...register("email", { required: true })}
          />
         
        </FormControl>

        <FormControl isInvalid={!passwordMatch}>
          <Input
            isRequired={true}
            placeholder="Password"
            type="password"
            {...register("password", {
              required: true,
            })}
            mb={5}
          />
          <Input
            isRequired={true}
            id="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            onChange={(e) => {
              setConfirmPassword(e.target.value)
            }}
          />
          <FormErrorMessage>Passwords do not match</FormErrorMessage>
        </FormControl>
        <button
          style={{
            padding: "5px",
            marginTop: "20px",
            borderRadius: "5px",
            width: "100%",
            fontWeight: "bold",
            background: "#6683A9",
            color: "white",
          }}
        >
          Sign Up
        </button>
      </form>

      <Text mt={10} fontSize="14px" textAlign={"center"}>
        Already have an account?{" "}
        <Link fontWeight="bold" textDecor={"underline"} href="/log-in">
          Log in here
        </Link>
      </Text>
    </Box>
  )
}
