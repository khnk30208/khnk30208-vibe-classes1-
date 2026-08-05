import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

// 로그인이 필요한 라우트를 감싼다.
// 비로그인 상태면 /login 으로 보내고, 원래 가려던 경로를 state 로 넘겨
// 로그인 성공 후 되돌아올 수 있게 한다.
export default function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" state={{ from }} replace />
  }

  return children
}
