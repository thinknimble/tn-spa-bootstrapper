import React from "react"
import { Route, Routes } from "react-router-dom"
import { Home, LogIn, Layout } from "../pages"

export const PUBLIC_ROUTES = ["/home", "/log-in"]

export const ROUTES = (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/log-in" element={<LogIn />} />
      {/* add more routes here */}
    </Route>
  </Routes>
)
