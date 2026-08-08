import { useEffect, useRef, useState } from 'react'
import styles from './SectionDock.module.css'
import { prefersReducedMotion } from '../utils/motion'

// 아이콘. constants 에 JSX 를 두지 않으려고 여기서 키를 그림으로 바꾼다
const ICONS = {
  heart:
    'M12 20.6 3.9 12.5a5 5 0 0 1 7.1-7.1l1 1 1-1a5 5 0 1 1 7.1 7.1Z',
  leaf:
    'M4 20c-1-8 4-15 16-16 1 12-6 17-13 16l-1 2H4Zm4-3c1-4 4-7 8-9-3 4-5 6-8 9Z',
  bowl:
    'M3 11h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9Zm3-3a3 3 0 0 1 1-4 3 3 0 0 0 1-2h2a5 5 0 0 1-1 3 3 3 0 0 0-1 3Zm5 0a3 3 0 0 1 1-4 3 3 0 0 0 1-2h2a5 5 0 0 1-1 3 3 3 0 0 0-1 3Z',
  run:
    'M13.5 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9.8 8.9 7 10.4 5.6 8.6l3.6-2.1a4 4 0 0 1 4.3.2l2 1.5 2.6-1 .8 1.9-3.6 1.4-1.5-1-1 3.4 3 2.4 1.4 5.3-2 .5-1.2-4.4-4-3.2-1.3 4-3.7 3.9-1.5-1.4 3.2-3.4Z',
  pin:
    'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z',
  chart:
    'M3 20h18v2H3ZM5 12h3v7H5Zm5.5-5h3v12h-3ZM16 9h3v10h-3Z',
  top: 'M12 4l8 8h-5v8H9v-8H4Z',
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.heart} />
    </svg>
  )
}

/**
 * 우측 고정 아이콘 독. 누르면 해당 섹션으로 스크롤하고,
 * 스크롤하면 현재 섹션이 자동으로 활성화된다 (스크롤 스파이)
 */
export default function SectionDock({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null)
  // 섹션별 노출 비율을 들고 있다가 가장 많이 보이는 것을 고른다
  const ratiosRef = useRef(new Map())

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)

    if (elements.length === 0) return undefined
    if (typeof IntersectionObserver === 'undefined') return undefined

    const ratios = ratiosRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        let bestId = null
        let bestRatio = 0

        // sections 순서로 훑어 동률이면 위쪽 섹션이 이긴다
        sections.forEach((section) => {
          const ratio = ratios.get(section.id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = section.id
          }
        })

        if (bestId) setActiveId(bestId)
      },
      {
        // sticky 헤더에 가린 부분은 보이는 것으로 치지 않는다
        rootMargin: '-56px 0px -35% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [sections])

  function goTo(id) {
    const element = document.getElementById(id)
    if (!element) return

    element.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
    setActiveId(id)
  }

  function goTop() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <nav className={styles.dock} aria-label="섹션 바로가기">
      {sections.map((section) => {
        const active = section.id === activeId

        return (
          <button
            key={section.id}
            type="button"
            className={`${styles.item} ${active ? styles.active : ''}`}
            onClick={() => goTo(section.id)}
            aria-current={active ? 'true' : undefined}
            aria-label={`${section.label} 섹션으로 이동`}
            title={section.label}
          >
            <Icon name={section.icon} />
            <span className={styles.label}>{section.label}</span>
          </button>
        )
      })}

      <span className={styles.divider} />

      <button
        type="button"
        className={styles.top}
        onClick={goTop}
        aria-label="맨 위로 이동"
        title="맨 위로"
      >
        <Icon name="top" />
      </button>
    </nav>
  )
}
