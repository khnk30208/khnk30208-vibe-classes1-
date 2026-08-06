import { useContext } from 'react'
import { AuthContext } from './authContext'

// 화면은 localStorage 를 직접 읽지 않고 이 훅으로만 로그인 상태에 접근한다
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.')
  }

  return context
}
