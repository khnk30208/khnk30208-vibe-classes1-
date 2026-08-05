import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { validateLogin } from '../service/authService'
import { toErrorMessage } from '../service/apiError'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [failMessage, setFailMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // RequireAuth 가 넘겨준 원래 목적지. 없으면 목록으로 보낸다.
  const redirectTo = location.state?.from ?? '/posts'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFailMessage('')

    const nextErrors = validateLogin(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFailMessage(toErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className="page-title">로그인</h1>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {failMessage && <p className="form-error">{failMessage}</p>}

        <div className="field">
          <label htmlFor="username">아이디</label>
          <input
            id="username"
            name="username"
            className="input"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn--primary w-full" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className={styles.link}>
        아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>

      <div className={styles.seed}>
        <strong>예제용 시드 계정</strong>
        <span>hongkd / pass1234 (홍길동)</span>
        <span>kimcs / pass1234 (김철수)</span>
      </div>
    </section>
  )
}
