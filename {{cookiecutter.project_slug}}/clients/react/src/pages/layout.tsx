import React from 'react'
import { Outlet } from 'react-router-dom'
import Logo from 'src/assets/images/logo.svg'

export function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
