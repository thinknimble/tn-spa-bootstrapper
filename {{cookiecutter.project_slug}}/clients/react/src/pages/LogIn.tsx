import React, { useState, useContext } from "react"
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
} from "@chakra-ui/react"
import { useMutation } from "@apollo/client"
import { LOG_IN } from "../utils/mutations"
import { AuthContext } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import Logo from "src/assets/images/logo.svg"

export default function LogIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const { updateToken } = useContext(AuthContext)

  let navigate = useNavigate()
  const [logIn] = useMutation(LOG_IN, {
    onCompleted: (data: any) => {
      localStorage.setItem("auth-token", data.tokenAuth.token)
      updateToken(data.tokenAuth.token)

      navigate("/verify")
    },
    onError: (error: any) => {
      if (error.message === "Please enter valid credentials") {
        setError(true)
      }
    },
  })

  const handleLogin = () => {
    logIn({
      variables: {
        email,
        password,
      },
    })
  }

  return (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "1fr 350px 350px 1fr",
      }}
      templateRows={{ base: "repeat(2, 2fr)" }}
    >
      <GridItem colStart={2} colEnd={3}>
        <VStack
          justify="center"
          align="center"
          h={{ base: "80vh", md: "50vh" }}
          mx={5}
          mt={{ base: 0, md: "30%" }}
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
                setEmail(e.target.value)
              }}
              my={5}
            />
            <Input
              mb={error ? 2 : 5}
              placeholder="Password"
              type="password"
              onChange={(e) => {
                setPassword(e.target.value)
              }}
            />
            {error ? (
              <FormErrorMessage mb={5}>
                Incorrect email and/or password
              </FormErrorMessage>
            ) : (
              <></>
            )}
          </FormControl>
          <Button onClick={handleLogin}>Sign In</Button>
          <Link fontSize="14px" textDecor={"underline"} href="/forgot-password">
            Forgot Password
          </Link>
        </VStack>
      </GridItem>
      <GridItem>
        {" "}
        <Hide breakpoint="(max-width: 48em)">
          <VStack
            justify="center"
            align="start"
            h={{ base: "80vh", md: "50vh" }}
            mx={5}
            mt={{ base: 0, md: "30%" }}
          >
            <Image src={Logo} />
          </VStack>
        </Hide>
      </GridItem>
      <GridItem rowStart={2} colStart={2} colEnd={4}>
        <Text mt={5} fontSize="14px" textAlign={"center"}>
          Don't have an account?{" "}
          <Link fontWeight="bold" textDecor={"underline"} href="/sign-up">
            Sign up here
          </Link>
        </Text>
      </GridItem>
    </Grid>
  )
}
