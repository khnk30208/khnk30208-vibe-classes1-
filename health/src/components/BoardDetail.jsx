import { useState } from 'react'
import styles from './BoardDetail.module.css'
import { formatDateTime } from '../utils/datetime'

// 삭제 확인만 자체 상태로 갖는다.
// window.confirm 을 쓰지 않는 이유: 네이티브 대화상자는 화면 밖이라 자동 검증이 어렵다
export default function BoardDetail({ post, canEdit, onBack, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  const edited = post.updatedAt && post.updatedAt !== post.createdAt

  return (
    <article className={styles.article}>
      <div className={styles.head}>
        <h2 className={styles.postTitle}>{post.title}</h2>
        <div className={styles.meta}>
          <span>{post.authorName}</span>
          <span>{formatDateTime(post.createdAt)}</span>
          {edited && <span>(수정됨 {formatDateTime(post.updatedAt)})</span>}
        </div>
      </div>

      <div className={styles.content}>{post.content}</div>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onBack}>
          목록
        </button>

        <div className={styles.spacer} />

        {/* 작성자 본인일 때만 노출. 판정은 postService 가 한다 */}
        {canEdit &&
          (confirming ? (
            <>
              <span className={styles.confirmText} role="status">
                정말 삭제할까요?
              </span>
              <button
                type="button"
                className={`${styles.button} ${styles.danger}`}
                onClick={onDelete}
              >
                삭제
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => setConfirming(false)}
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.button}
                onClick={() => onEdit(post.id)}
              >
                수정
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.danger}`}
                onClick={() => setConfirming(true)}
              >
                삭제
              </button>
            </>
          ))}
      </div>
    </article>
  )
}
