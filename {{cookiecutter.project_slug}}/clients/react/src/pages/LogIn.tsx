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
      navigate("/home")
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
    <div className="grid h-screen place-items-center">
      <div className="w-full max-w-xs">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              // for="username"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="Email"
              type="text"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              // for="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-red-500 text-xs italic">
              Please choose a password.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleLogin}
            >
              Log In
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs"></p>
      </div>
    </div>
  )
}
