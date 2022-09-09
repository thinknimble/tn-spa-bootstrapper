import React, { useState, useContext } from "react"
import { AuthContext, logout } from "src/utils/auth"
import { Outlet, useNavigate } from "react-router-dom"

export default function Home() {
  const { updateToken } = useContext(AuthContext)
  const navigate = useNavigate()

  const logUserOut = () => {
    logout()
    updateToken(null)
    navigate("/log-in")
  }

  // return <button onClick={() => logUserOut()}> Sign out</button>

  return (
    <>
      <button
        onClick={() => logUserOut()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign out
      </button>
    </>
  )
}
