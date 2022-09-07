import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import Login from "../pages/LogIn"

export const PUBLIC_ROUTES = ["/home", "/log-in"]

export const ROUTES = (
  <Routes>
    <Route path="/log-in" element={<Login />} />
    <Route path="/" element={<Home />}>
      <Route path="/home" element={<Home />} />

      {/* add more routes here */}
    </Route>
  </Routes>
)
