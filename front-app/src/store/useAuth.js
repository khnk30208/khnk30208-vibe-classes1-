import { useContext } from 'react'
import { AuthContext } from './authContext'

export const useAuth = () => {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.')
  }
  return value
}
