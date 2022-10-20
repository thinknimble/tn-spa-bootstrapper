import React from "react"
import { Route, Routes } from "react-router-dom"
import { Home, LogIn, Layout, SignUp } from "../pages"

export const PUBLIC_ROUTES = ["/home", "log-in", "sign-up"]

export const ROUTES = (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      {/* add more routes here */}
    </Route>
  </Routes>
)
