import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import App from "../App"

export const PUBLIC_ROUTES = ["/home"]

export const ROUTES = (
  <Routes>
    <Route path="/" element={<App />}>
      <Route path="/home" element={<Home />} />
      {/* add more routes here */}
    </Route>
  </Routes>
)
