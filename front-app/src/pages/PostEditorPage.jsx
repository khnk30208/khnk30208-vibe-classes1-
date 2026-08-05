import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import {
  TITLE_MAX_LENGTH,
  canEditPost,
  getPost,
  savePost,
  validatePostForm,
} from '../service/postService'
import { toErrorMessage } from '../service/apiError'
import styles from './PostEditorPage.module.css'

export default function PostEditorPage() {
  const { id } = useParams()
  const postId = id ? Number(id) : null
  const isEdit = postId !== null
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({ title: '', content: '' })
  const [errors, setErrors] = useState({})
  const [failMessage, setFailMessage] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [blocked, setBlocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 수정 화면은 기존 값을 채운 상태로 연다.
  useEffect(() => {
    if (!isEdit) return undefined

    let cancelled = false
    setLoading(true)

    getPost(postId)
      .then((post) => {
        if (cancelled) return
        // 권한 판정은 service 가 하고, 화면은 결과만 쓴다.
        if (!canEditPost(post, user)) {
          setBlocked(true)
          setFailMessage('본인이 작성한 글만 수정할 수 있습니다.')
          return
        }
        setForm({ title: post.title, content: post.content })
      })
      .catch((cause) => {
        if (cancelled) return
        setBlocked(true)
        setFailMessage(toErrorMessage(cause))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, postId, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFailMessage('')

    const nextErrors = validatePostForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const saved = await savePost(postId, form)
      navigate(`/posts/${saved.id}`, { replace: true })
    } catch (cause) {
      setFailMessage(toErrorMessage(cause))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="empty">불러오는 중...</p>

  if (blocked) {
    return (
      <section>
        <p className="form-error">{failMessage}</p>
        <Link to="/posts" className="btn">
          목록으로
        </Link>
      </section>
    )
  }

  return (
    <section>
      <h1 className="page-title">{isEdit ? '글 수정' : '글쓰기'}</h1>

      <form onSubmit={handleSubmit} noValidate>
        {failMessage && <p className="form-error">{failMessage}</p>}

        <div className="field">
          <label htmlFor="title">
            제목
            <span className={styles.counter}>
              {form.title.length} / {TITLE_MAX_LENGTH}
            </span>
          </label>
          <input
            id="title"
            name="title"
            className="input"
            value={form.title}
            onChange={handleChange}
            maxLength={TITLE_MAX_LENGTH}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="field">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            className="textarea"
            value={form.content}
            onChange={handleChange}
          />
          {errors.content && <span className="field-error">{errors.content}</span>}
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </section>
  )
}
