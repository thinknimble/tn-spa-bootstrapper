import { Outlet } from 'react-router-dom'
import { NavBar } from 'src/components/nav-bar'

export const Layout = () => {
  return (
    <div className="font-avenir text-primary flex min-h-screen flex-col pt-16 text-center antialiased">
      <NavBar />
      <Outlet />
    </div>
  )
}
