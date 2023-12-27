import { NavLink, Link, useNavigate } from 'react-router-dom'
import { logout, useAuth } from 'src/stores/auth'
import { useState } from 'react'
import { useUser } from 'src/services/user'
import BarsIcon from '../assets/images/bars.svg'
import XMark from '../assets/images/x-mark.svg'
import Logo from '../assets/images/logo.svg'
import ProfileCircle from '../assets/images/profile-circle.svg'
import 'src/styles/nav-bar.css'
import { User } from 'src/services/user/models'

const UserInfo = ({ user }: { user: User | undefined }) => {
  return (
    <>
      <div className="text-base font-medium text-gray-800">
        {user?.firstName} {user?.lastName}
      </div>
      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
    </>
  )
}

export const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const token = useAuth.use.token()
  const { data: user } = useUser()
  const isAuth = Boolean(token)

  const navigate = useNavigate()
  const logOutUser = () => {
    logout()
    navigate('/log-in')
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <nav className="fixed top-0 z-10 w-full bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <NavLink
              to="/home"
              className="flex flex-shrink-0 items-center"
              onClick={toggleMobileMenu}
            >
              <img className="h-4" src={Logo} alt="ThinkNimble" />
            </NavLink>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/home" className={({ isActive }) => `router ${isActive && 'active'}`}>
                Home
              </NavLink>
              {isAuth && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `router ${isActive && 'active'}`}
                >
                  Dashboard
                </NavLink>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isAuth && (
              <>
                <Link data-cy="login-btn" to="/log-in" className="btn--primary bg-primary">
                  Login
                </Link>
                <Link to="/sign-up" className="btn--secondary ml-5">
                  Signup
                </Link>
              </>
            )}

            {isAuth && (
              <div className="relative ml-3 focus:ring-2">
                <img
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="h-8 w-8 cursor-pointer rounded-full"
                  src={ProfileCircle}
                  alt="Profile"
                />
                {profileMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div
                      className="block cursor-pointer px-4 py-2 text-sm text-gray-700"
                      onClick={logOutUser}
                    >
                      Log Out
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* <!-- Mobile menu button --> */}
            <div className="rounded-md p-2 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
              {!mobileMenuOpen ? (
                <img
                  className="block h-6 w-6 cursor-pointer"
                  src={BarsIcon}
                  alt="Bars"
                  onClick={toggleMobileMenu}
                />
              ) : (
                <img
                  src={XMark}
                  alt="Close"
                  className="text-primary block h-6 w-6 cursor-pointer"
                  onClick={toggleMobileMenu}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <NavLink
              to="/home"
              className={({ isActive }) => `mobile-link--main ${isActive && 'active--mobile'}`}
              onClick={toggleMobileMenu}
            >
              Home
            </NavLink>
            {isAuth && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `mobile-link--main ${isActive && 'active--mobile'}`}
                onClick={toggleMobileMenu}
              >
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            {isAuth && (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src={ProfileCircle} alt="Profile" />
                </div>
                <div className="ml-3">
                  <UserInfo user={user} />
                </div>
              </div>
            )}
            <div className="mt-3 space-y-1">
              {!isAuth && (
                <>
                  <NavLink
                    to="/sign-up"
                    className={({ isActive }) => `mobile-link ${isActive && 'active--mobile'}`}
                    onClick={toggleMobileMenu}
                  >
                    Signup
                  </NavLink>
                  <NavLink
                    to="/log-in"
                    className={({ isActive }) => `mobile-link ${isActive && 'active--mobile'}`}
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </NavLink>
                </>
              )}
              {isAuth && (
                <div className="mobile-link" onClick={logOutUser}>
                  Log Out
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
