import { useState } from 'react'
import styles from './AuthPage.module.css'
import { useAuth } from '../store/useAuth'

// [범위 주의] 헤더의 로그인 상태를 확인하기 위한 최소 로그인 화면이다.
// work.md 3.1 회원가입 / 3.2 로그인 실패 처리는 다음 작업에서 채운다
export default function AuthPage({ onClose }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    try {
      login({ username, password })
      setPassword('')
      onClose()
    } catch (loginError) {
      setError(loginError.message)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>로그인</h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            아이디
          </label>
          <input
            id="username"
            className={styles.input}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            로그인
          </button>
          <button type="button" className={styles.secondary} onClick={onClose}>
            취소
          </button>
        </div>

        <p className={styles.hint}>
          아직 목 서버가 없어 아이디·비밀번호만 채우면 로그인됩니다.
        </p>
      </form>
    </div>
  )
}
