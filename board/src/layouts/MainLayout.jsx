import { useState } from 'react'
import styles from './MainLayout.module.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HomePage from '../pages/HomePage'
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

  function renderMenuContent() {
    switch (activeMenu) {
      case 'home':
        return <HomePage />
      case 'board':
        return <PlaceholderPage title="게시판" />
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
        {/* authView 가 있으면 인증 화면, 없으면 선택된 메뉴의 컨텐츠 */}
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
