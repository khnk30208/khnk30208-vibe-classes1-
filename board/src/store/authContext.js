import { createContext } from 'react'

// 컴포넌트와 비컴포넌트를 한 파일에서 export 하면 oxlint 가 경고하므로
// context 객체만 따로 둔다
export const AuthContext = createContext(null)
