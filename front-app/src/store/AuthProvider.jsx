import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import {
  getStoredUser,
  loginUser,
  signupUser,
  clearSession,
} from '../service/authService'

// 로그인 상태를 관리하는 유일한 곳.
// 다른 컴포넌트는 localStorage 를 직접 읽지 않고 useAuth() 를 쓴다.
export default function AuthProvider({ children }) {
  // 새로고침해도 로그인이 유지되도록 저장된 사용자로 초기화한다.
  const [user, setUser] = useState(getStoredUser)

  const login = useCallback(async (form) => {
    const loggedIn = await loginUser(form)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const signup = useCallback(async (form) => {
    const created = await signupUser(form)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), login, signup, logout }),
    [user, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
