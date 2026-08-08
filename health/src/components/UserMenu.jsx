import { useEffect, useRef, useState } from 'react'
import styles from './UserMenu.module.css'

// 사용자 이름 앞 사람 아이콘 (doc/header-menu.md 5. 디자인 명세)
function PersonIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  )
}

function CaretIcon({ open }) {
  return (
    <svg
      className={`${styles.caret} ${open ? styles.caretOpen : ''}`}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 8.5 1.5 4h9L6 8.5Z" />
    </svg>
  )
}

// 열림 상태만 자체적으로 갖는다. 로그인 정보와 선택 처리는 props 로 받는다
export default function UserMenu({ nickname, onSelectProfile, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // 바깥 클릭 / Esc 로 닫는다
  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleSelect(action) {
    setOpen(false)
    action()
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <PersonIcon />
        {nickname}
        <CaretIcon open={open} />
      </button>

      {open && (
        <ul className={styles.dropdown} role="menu">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.dropdownItem}
              onClick={() => handleSelect(onSelectProfile)}
            >
              profile
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.dropdownItem}
              onClick={() => handleSelect(onLogout)}
            >
              logout
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
