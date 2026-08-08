import styles from './Footer.module.css'

// 헤더와 같은 방식으로 컨텐츠만 바꾼다 (페이지 이동 없음)
export default function Footer({ menus, activeMenu, onSelectMenu }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {menus.map((menu) => (
          <button
            key={menu.key}
            type="button"
            className={[
              styles.menuButton,
              activeMenu === menu.key ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectMenu(menu.key)}
          >
            {menu.label}
          </button>
        ))}
      </div>

      {/* 면책 문구는 디자인이 바뀌어도 계속 노출한다 (CLAUDE.md 5장) */}
      <p className={styles.notice}>
        본 사이트의 분석 결과는 일반적인 참고 정보이며 의학적 진단이 아닙니다.
        건강 이상이 의심되면 반드시 의료 전문가와 상담하세요.
      </p>
    </footer>
  )
}
