import { createContext } from 'react'

// Context 객체만 둔다. Provider 는 AuthProvider.jsx, 훅은 useAuth.js
export const AuthContext = createContext(null)
