import styles from './PlaceholderPage.module.css'

// 게시판 / 소개 / 문의사항 / profile 자리만 잡아 둔다.
// 내용은 다음 작업에서 채운다 (doc/header-menu.md 3.2)
export default function PlaceholderPage({ title, description }) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description ?? '준비 중입니다.'}</p>
    </div>
  )
}
