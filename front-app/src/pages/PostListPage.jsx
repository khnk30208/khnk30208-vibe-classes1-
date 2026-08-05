import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { getPostPage } from '../service/postService'
import { toErrorMessage } from '../service/apiError'
import { formatDate } from '../utils/formatDate'
import Pagination from '../components/Pagination'
import styles from './PostListPage.module.css'

const EMPTY_RESULT = { items: [], total: 0, page: 1, totalPages: 1 }

export default function PostListPage() {
  const { isLoggedIn } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const keyword = searchParams.get('keyword') ?? ''

  const [term, setTerm] = useState(keyword)
  const [result, setResult] = useState(EMPTY_RESULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPostPage({ page, keyword })
      .then((data) => {
        if (cancelled) return
        setResult(data)
        setError('')
      })
      .catch((cause) => {
        if (cancelled) return
        setResult(EMPTY_RESULT)
        setError(toErrorMessage(cause))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, keyword])

  // 뒤로가기 등으로 URL 이 바뀌면 검색창도 따라간다.
  useEffect(() => {
    setTerm(keyword)
  }, [keyword])

  const moveTo = (nextPage, nextKeyword) => {
    const params = {}
    if (nextPage > 1) params.page = String(nextPage)
    if (nextKeyword) params.keyword = nextKeyword
    setSearchParams(params)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    moveTo(1, term.trim())
  }

  return (
    <section>
      <h1 className="page-title">게시글 목록</h1>

      <div className={styles.toolbar}>
        <form className={styles.search} onSubmit={handleSearch}>
          <input
            className="input"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="제목 또는 작성자 검색"
            aria-label="검색어"
          />
          <button type="submit" className="btn">
            검색
          </button>
        </form>

        {isLoggedIn && (
          <Link to="/posts/new" className="btn btn--primary">
            글쓰기
          </Link>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="empty">불러오는 중...</p>
      ) : result.items.length === 0 ? (
        <p className="empty">
          {keyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
        </p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className={styles.colNumber}>번호</th>
                <th>제목</th>
                <th className={styles.colAuthor}>작성자</th>
                <th className={styles.colDate}>작성일</th>
                <th className={styles.colViews}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((post) => (
                <tr key={post.id}>
                  <td>{post.displayNumber}</td>
                  <td className={styles.titleCell}>
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </td>
                  <td>{post.authorNickname}</td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td>{post.viewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(nextPage) => moveTo(nextPage, keyword)}
          />
        </>
      )}
    </section>
  )
}
