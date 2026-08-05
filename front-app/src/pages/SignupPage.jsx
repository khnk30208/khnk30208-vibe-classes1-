import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { validateSignup } from '../service/authService'
import { toErrorMessage } from '../service/apiError'
import styles from './SignupPage.module.css'

const EMPTY_FORM = {
  username: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [failMessage, setFailMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFailMessage('')

    const nextErrors = validateSignup(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      // 가입 성공 시 자동으로 로그인 상태가 된다.
      await signup(form)
      navigate('/posts', { replace: true })
    } catch (error) {
      setFailMessage(toErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className="page-title">회원가입</h1>

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
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="field">
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            className="input"
            value={form.passwordConfirm}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.passwordConfirm && (
            <span className="field-error">{errors.passwordConfirm}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="nickname">닉네임</label>
          <input
            id="nickname"
            name="nickname"
            className="input"
            value={form.nickname}
            onChange={handleChange}
            autoComplete="nickname"
          />
          {errors.nickname && <span className="field-error">{errors.nickname}</span>}
        </div>

        <button type="submit" className="btn btn--primary w-full" disabled={submitting}>
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className={styles.link}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </section>
  )
}
