import React from 'react'
import { logout } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
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
