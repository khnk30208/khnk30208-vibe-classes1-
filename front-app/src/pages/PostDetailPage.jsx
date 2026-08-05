import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { canEditPost, getPost, readPost, removePost } from '../service/postService'
import { toErrorMessage } from '../service/apiError'
import { formatDateTime } from '../utils/formatDate'
import styles from './PostDetailPage.module.css'

export default function PostDetailPage() {
  const { id } = useParams()
  const postId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  // 같은 글에서 조회수가 두 번 올라가지 않도록 기억해 둔다.
  const viewedIdRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const alreadyViewed = viewedIdRef.current === postId
    viewedIdRef.current = postId
    setLoading(true)

    const load = alreadyViewed ? getPost(postId) : readPost(postId)

    load
      .then((data) => {
        if (cancelled) return
        setPost(data)
        setError('')
      })
      .catch((cause) => {
        if (cancelled) return
        setPost(null)
        setError(toErrorMessage(cause))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId])

  const handleDelete = async () => {
    if (!window.confirm('이 게시글을 삭제할까요?')) return

    setDeleting(true)
    try {
      await removePost(postId)
      navigate('/posts', { replace: true })
    } catch (cause) {
      setError(toErrorMessage(cause))
      setDeleting(false)
    }
  }

  if (loading) return <p className="empty">불러오는 중...</p>

  if (!post) {
    return (
      <section>
        <p className="form-error">{error || '게시글을 찾을 수 없습니다.'}</p>
        <Link to="/posts" className="btn">
          목록으로
        </Link>
      </section>
    )
  }

  const editable = canEditPost(post, user)

  return (
    <section>
      {error && <p className="form-error">{error}</p>}

      <article className={styles.article}>
        <h1 className={styles.title}>{post.title}</h1>

        <dl className={styles.meta}>
          <div>
            <dt>작성자</dt>
            <dd>{post.authorNickname}</dd>
          </div>
          <div>
            <dt>작성일</dt>
            <dd>{formatDateTime(post.createdAt)}</dd>
          </div>
          <div>
            <dt>조회수</dt>
            <dd>{post.viewCount}</dd>
          </div>
        </dl>

        <div className={styles.content}>{post.content}</div>
      </article>

      <div className={styles.actions}>
        <Link to="/posts" className="btn">
          목록으로
        </Link>

        {editable && (
          <div className={styles.ownerActions}>
            <Link to={`/posts/${post.id}/edit`} className="btn">
              수정
            </Link>
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
