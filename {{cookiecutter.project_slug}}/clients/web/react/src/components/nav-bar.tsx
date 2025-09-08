import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from 'src/stores/auth'
import { useState } from 'react'
import { useLogout, useUser } from 'src/services/user'
import BarsIcon from '../assets/images/bars.svg'
import XMark from '../assets/images/x-mark.svg'
import Logo from '../assets/images/logo.svg'
import ProfileCircle from '../assets/images/profile-circle.svg'
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
  const { mutate: logout } = useLogout()

  const navigate = useNavigate()
  const logOutUser = () => {
    toggleMobileMenu()
    logout(undefined, {
      onSettled: () => {
        navigate('/log-in')
      },
    })
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
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:cursor-pointer ${isActive && 'border-accent'}`
                }
              >
                Home
              </NavLink>
              {isAuth && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:cursor-pointer ${isActive && 'border-accent'}`
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {isAuth && (
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:cursor-pointer ${isActive && 'border-accent'}`
                  }
                >
                  Chat Demo
                </NavLink>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isAuth && (
              <>
                <Link
                  data-cy="login"
                  to="/log-in"
                  className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primaryLight"
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="ml-5 flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
                >
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
                  className="block h-6 w-6 cursor-pointer text-primary"
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
              className={({ isActive }) =>
                `block border-l-4 py-2 pl-3 pr-4 text-base font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 ${isActive && 'border-l-4 border-accent text-accent'}`
              }
              onClick={toggleMobileMenu}
            >
              Home
            </NavLink>
            {isAuth && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block border-l-4 py-2 pl-3 pr-4 text-base font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 ${isActive && 'border-l-4 border-accent text-accent'}`
                }
                onClick={toggleMobileMenu}
              >
                Dashboard
              </NavLink>
            )}
            {isAuth && (
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `block border-l-4 py-2 pl-3 pr-4 text-base font-medium hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 ${isActive && 'border-l-4 border-accent text-accent'}`
                }
                onClick={toggleMobileMenu}
              >
                Chat Demo
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
                    className={({ isActive }) =>
                      `block cursor-pointer border-l-4 px-4 py-2 text-base font-medium hover:bg-gray-100 hover:text-gray-800 ${isActive && 'border-l-4 border-accent text-accent'}`
                    }
                    onClick={toggleMobileMenu}
                  >
                    Signup
                  </NavLink>
                  <NavLink
                    to="/log-in"
                    className={({ isActive }) =>
                      `block cursor-pointer border-l-4 px-4 py-2 text-base font-medium hover:bg-gray-100 hover:text-gray-800 ${isActive && 'border-l-4 border-accent text-accent'}`
                    }
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </NavLink>
                </>
              )}
              {isAuth && (
                <div
                  className="block cursor-pointer border-l-4 px-4 py-2 text-base font-medium hover:bg-gray-100 hover:text-gray-800"
                  onClick={logOutUser}
                >
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
