import styles from './BoardList.module.css'
import { formatDateTime } from '../utils/datetime'

// 스스로 화면을 바꾸지 않는다. 전환은 props 로 받은 함수를 호출만 한다 (CLAUDE.md 4.4)
export default function BoardList({
  posts,
  page,
  totalPages,
  total,
  canWrite,
  onSelectPost,
  onWrite,
  onChangePage,
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div>
      <div className={styles.toolbar}>
        <span className={styles.count}>전체 {total}건</span>

        {/* 글쓰기는 로그인 사용자만 (doc/board.md 2.3) */}
        {canWrite && (
          <button type="button" className={styles.writeButton} onClick={onWrite}>
            글쓰기
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className={styles.empty}>등록된 글이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>제목</th>
              <th className={styles.th}>작성자</th>
              <th className={styles.th}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className={`${styles.td} ${styles.titleCell}`}>
                  <button
                    type="button"
                    className={styles.titleButton}
                    onClick={() => onSelectPost(post.id)}
                  >
                    {post.title}
                  </button>
                </td>
                <td className={`${styles.td} ${styles.meta}`}>{post.authorName}</td>
                <td className={`${styles.td} ${styles.meta}`}>
                  {formatDateTime(post.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onChangePage(page - 1)}
            disabled={page <= 1}
          >
            이전
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              type="button"
              className={[styles.pageButton, number === page ? styles.current : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChangePage(number)}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onChangePage(page + 1)}
            disabled={page >= totalPages}
          >
            다음
          </button>
        </nav>
      )}
    </div>
  )
}
