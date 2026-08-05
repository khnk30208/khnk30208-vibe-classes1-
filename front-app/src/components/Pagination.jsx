import styles from './Pagination.module.css'

const WINDOW_SIZE = 10

const buildPages = (page, totalPages) => {
  const start = Math.max(1, Math.min(page - Math.floor(WINDOW_SIZE / 2), totalPages - WINDOW_SIZE + 1))
  const from = Math.max(1, start)
  const to = Math.min(totalPages, from + WINDOW_SIZE - 1)
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="페이지 목록">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        이전
      </button>

      {buildPages(page, totalPages).map((number) => (
        <button
          key={number}
          type="button"
          className={number === page ? `${styles.page} ${styles.current}` : styles.page}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        다음
      </button>
    </nav>
  )
}
