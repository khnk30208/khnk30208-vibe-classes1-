import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import styles from './Header.module.css'

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/posts')
  }

  return (
    <header className={styles.header}>
      <Link to="/posts" className={styles.brand}>
        게시판
      </Link>

      <nav className={styles.nav}>
        {isLoggedIn ? (
          <>
            <span className={styles.nickname}>{user.nickname}</span>
            <button type="button" className="btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">
              로그인
            </Link>
            <Link to="/signup" className="btn btn--primary">
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
