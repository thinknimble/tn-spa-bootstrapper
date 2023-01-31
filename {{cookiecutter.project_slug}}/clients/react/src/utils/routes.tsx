import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Layout } from 'src/pages'
//TODO: move these to pages index so you import them from line above
import { LogIn } from 'src/pages/log-in'
import { SignUp } from 'src/pages/sign-up'

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
