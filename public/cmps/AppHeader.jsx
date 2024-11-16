const { useState, useEffect } = React
const { NavLink, useNavigate } = ReactRouterDOM
import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSighup.jsx'
import { userService } from '../services/user.service.js'

export function AppHeader() {
  const [user, setUser] = useState(userService.getLoggedInUser())
  const navigate = useNavigate()

  function onLogout() {
    userService.logout().then(() => {
      setUser(null)
      navigate('/')
    })
  }

  return (
    <React.Fragment>
      <header className="flex align-center space-between">
        {!user && <LoginSignup setUser={setUser} />}
        {user && (
          <div className="nav-bar-container flex space-between">
            <nav className="nav-bar">
              <NavLink to="/bug">Bugs</NavLink>
              {user && <NavLink to="/user">Profile</NavLink>}
              {user && user.isAdmin && <NavLink to="/admin">Admin</NavLink>}
              <NavLink to="/about">About</NavLink>
            </nav>
            <div>
              <p>Hello {user.fullname}</p>
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      <UserMsg />
    </React.Fragment>
  )
}