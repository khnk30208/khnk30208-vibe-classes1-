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
    </footer>
  )
}
