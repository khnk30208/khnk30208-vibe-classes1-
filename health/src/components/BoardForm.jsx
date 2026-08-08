import { useState } from 'react'
import styles from './BoardForm.module.css'

const TITLE_MAX = 100
const CONTENT_MAX = 2000

// 글쓰기/수정 공용 폼. 저장 여부는 부모가 판단한다
export default function BoardForm({
  mode = 'write',
  initialTitle = '',
  initialContent = '',
  submitting,
  error,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ title, content })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        제목
        <input
          type="text"
          className={styles.input}
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className={styles.counter}>
          {title.length} / {TITLE_MAX}
        </span>
      </label>

      <label className={styles.label}>
        내용
        <textarea
          className={styles.textarea}
          value={content}
          maxLength={CONTENT_MAX}
          onChange={(e) => setContent(e.target.value)}
        />
        <span className={styles.counter}>
          {content.length} / {CONTENT_MAX}
        </span>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? '저장중...' : mode === 'edit' ? '수정' : '등록'}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  )
}
