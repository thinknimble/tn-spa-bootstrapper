import React, { useState, useContext } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { LOG_IN } from "src/utils/mutations"
import { useNavigate } from "react-router-dom"

import { AuthContext } from "src/utils/auth"
export default function LogIn() {
  const { updateToken } = useContext(AuthContext)
  const navigate = useNavigate()
  function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email)
  }
  const [login] = useMutation(LOG_IN, {
    onCompleted: (data) => {
      localStorage.setItem("auth-token", data.tokenAuth.token)
      updateToken(data.tokenAuth.token)
      navigate("/surveys")
    },
    onError: (error) => {
      const errorMessage = error
      setShowAlert(true)
    },
  })
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [showAlert, setShowAlert] = useState(false)

  const handleLogin = (e: any) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setError("Please enter valid email")
    } else {
      setError(null)
      login({
        variables: {
          email,
          password,
        },
      })
    }
  }
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.1.2/tailwind.min.css"
      />

      <div className="grid grid-cols-5 gap-3">
        <div className="bg-blue-100">1st col</div>
        <div className="bg-red-100 col-span-4">2nd col</div>
      </div>
    </>
  )
}
