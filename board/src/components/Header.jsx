import styles from './Header.module.css'
import UserMenu from './UserMenu'
import { useAuth } from '../store/useAuth'

// 상태를 갖지 않는다. 그리기와 클릭 전달만 한다
export default function Header({
  menus,
  activeMenu,
  onSelectMenu,
  onOpenAuth,
  onSelectProfile,
}) {
  const { isLoggedIn, user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          {menus.map((menu) => (
            <button
              key={menu.key}
              type="button"
              className={[
                styles.menuButton,
                menu.isLogo ? styles.logo : '',
                activeMenu === menu.key ? styles.active : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectMenu(menu.key)}
            >
              {menu.label}
            </button>
          ))}
        </nav>

        <div className={styles.spacer} />

        {isLoggedIn ? (
          <UserMenu
            nickname={user.nickname}
            onSelectProfile={onSelectProfile}
            onLogout={logout}
          />
        ) : (
          <button
            type="button"
            className={styles.loginButton}
            onClick={() => onOpenAuth('login')}
          >
            로그인
          </button>
        )}
      </div>
    </header>
  )
}
