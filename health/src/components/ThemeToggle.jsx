import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

const STORAGE_KEY = 'health:theme'

// 첫 페인트 전 테마 적용은 index.html 의 인라인 스크립트가 한다.
// 여기서는 현재 상태를 읽어와 토글만 담당한다
function readInitialTheme() {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  return prefersDark ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // 저장소를 못 쓰는 환경이면 이번 세션에만 적용된다
    }
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? '어두운 테마로 전환' : '밝은 테마로 전환'}
      title={next === 'dark' ? '어두운 테마' : '밝은 테마'}
    >
      <svg className={styles.moon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.7 14.6A8.5 8.5 0 0 1 9.4 3.3a8.7 8.7 0 1 0 11.3 11.3Z" />
      </svg>
      <svg className={styles.sun} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 17.4a5.4 5.4 0 1 1 0-10.8 5.4 5.4 0 0 1 0 10.8Zm0-13.1a1.1 1.1 0 0 1-1.1-1.1V2a1.1 1.1 0 0 1 2.2 0v1.2a1.1 1.1 0 0 1-1.1 1.1Zm0 17.4a1.1 1.1 0 0 1-1.1-1.1v-1.2a1.1 1.1 0 0 1 2.2 0v1.2a1.1 1.1 0 0 1-1.1 1.1ZM22 13.1h-1.2a1.1 1.1 0 0 1 0-2.2H22a1.1 1.1 0 0 1 0 2.2Zm-18.8 0H2a1.1 1.1 0 0 1 0-2.2h1.2a1.1 1.1 0 0 1 0 2.2Zm15.1-6.2a1.1 1.1 0 0 1-.8-1.9l.9-.8a1.1 1.1 0 0 1 1.5 1.5l-.8.9a1.1 1.1 0 0 1-.8.3ZM5.1 20a1.1 1.1 0 0 1-.8-1.9l.8-.9a1.1 1.1 0 0 1 1.6 1.6l-.9.8a1.1 1.1 0 0 1-.7.4Zm13.8 0a1.1 1.1 0 0 1-.8-.4l-.8-.9a1.1 1.1 0 0 1 1.5-1.5l.9.8a1.1 1.1 0 0 1-.8 2ZM5.1 6.9a1.1 1.1 0 0 1-.8-.3l-.8-.9a1.1 1.1 0 0 1 1.5-1.5l.9.8a1.1 1.1 0 0 1-.8 1.9Z" />
      </svg>
    </button>
  )
}
