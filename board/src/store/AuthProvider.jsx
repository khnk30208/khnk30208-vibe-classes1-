import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import * as authService from '../service/authService'

// 로그인 상태를 이 한 곳에서만 관리한다
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())

  const login = useCallback((credentials) => {
    const loggedInUser = authService.login(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
