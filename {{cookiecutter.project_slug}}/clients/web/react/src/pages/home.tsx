import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from 'src/stores/auth'

export const Home = () => {
  const navigate = useNavigate()
  const logOutUser = () => {
    logout()
    navigate('/log-in')
  }

  return (
    <>
      <h1>Dashboard</h1>
      <button onClick={logOutUser}>logout</button>
    </>
  )
}
