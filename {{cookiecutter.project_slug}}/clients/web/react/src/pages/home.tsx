import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from 'services/user'

export const Home = () => {
  const navigate = useNavigate()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const logOutUser = () => {
    logout(undefined,{
      onSettled:()=>{
        navigate('/log-in')
      }
    })
  }

  return (
    <>
      <h1>Dashboard</h1>
      <button onClick={logOutUser}>logout</button>
    </>
  )
}
