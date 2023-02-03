import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Layout, LogIn, SignUp } from 'src/pages'

export const PUBLIC_ROUTES = ['/home', '/log-in', '/sign-up']

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        {/* add more routes here */}
      </Route>
    </Routes>
  )
}
