import { useState } from 'react'
import styles from './AuthPage.module.css'
import { useAuth } from '../store/useAuth'

// [범위 주의] 헤더의 로그인/비로그인 두 모습을 확인하기 위한 최소 구현이다.
// 회원가입·검증 규칙·실패 처리는 다음 작업에서 채운다 (doc/header-menu.md 2.4)
export default function AuthPage({ onClose }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    try {
      login({ username, password })
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>로그인</h1>

        <label className={styles.label}>
          아이디
          <input
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className={styles.label}>
          비밀번호
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit}>
            로그인
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
        </div>

        <p className={styles.notice}>
          이번 단계는 헤더 동작 확인을 위한 임시 로그인입니다. 입력한 계정은 이
          브라우저에만 저장됩니다.
        </p>
      </form>
    </div>
  )
}
