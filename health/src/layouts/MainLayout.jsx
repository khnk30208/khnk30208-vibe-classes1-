import { useState } from 'react'
import styles from './MainLayout.module.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HomePage from '../pages/HomePage'
import BoardPage from '../pages/BoardPage'
import AuthPage from '../pages/AuthPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import {
  DEFAULT_MENU_KEY,
  FOOTER_MENUS,
  MENUS,
  PROFILE_MENU_KEY,
} from '../constants/menus'

// 메뉴를 눌러도 페이지 이동을 하지 않는다.
// URL 은 그대로 두고 이 컴포넌트의 컨텐츠 영역만 교체한다
export default function MainLayout() {
  const [activeMenu, setActiveMenu] = useState(DEFAULT_MENU_KEY)
  const [authView, setAuthView] = useState(null)

  // 메뉴가 늘어나면 MENUS 항목 하나 + 여기 분기 한 줄만 추가한다
  function renderMenuContent() {
    switch (activeMenu) {
      case 'home':
        return <HomePage />
      case 'board':
        return <BoardPage />
      case 'about':
        return <PlaceholderPage title="소개" />
      case 'contact':
        return <PlaceholderPage title="문의사항" />
      case PROFILE_MENU_KEY:
        return <PlaceholderPage title="profile" />
      default:
        return <HomePage />
    }
  }

  // 메뉴를 고르면 인증 화면은 닫는다
  function selectMenu(key) {
    setAuthView(null)
    setActiveMenu(key)
  }

  return (
    <div className={styles.layout}>
      <Header
        menus={MENUS}
        activeMenu={authView ? null : activeMenu}
        onSelectMenu={selectMenu}
        onOpenAuth={setAuthView}
        onSelectProfile={() => selectMenu(PROFILE_MENU_KEY)}
      />

      <main className={styles.content}>
        {/* authView 가 있으면 인증 화면, 없으면 선택된 메뉴의 컨텐츠.
            닫을 때 authView 만 null 로 되돌리므로 보던 화면으로 돌아온다 */}
        {authView ? (
          <AuthPage onClose={() => setAuthView(null)} />
        ) : (
          renderMenuContent()
        )}
      </main>

      <Footer
        menus={FOOTER_MENUS}
        activeMenu={authView ? null : activeMenu}
        onSelectMenu={selectMenu}
      />
    </div>
  )
}
