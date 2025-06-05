import { Outlet } from 'react-router-dom'
import { NavBar } from 'src/components/nav-bar'

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col pt-16 text-center font-avenir text-primary antialiased">
      <NavBar />
      <Outlet />
    </div>
  )
}
