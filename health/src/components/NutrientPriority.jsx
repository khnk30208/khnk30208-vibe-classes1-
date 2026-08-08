import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NutrientPriority.module.css'
import NutrientRadar from './NutrientRadar'
import { isGeneralOnly, scoreNutrientGroups } from '../service/nutritionService'
import { NUTRIENT_GROUPS, STEP_MS } from '../constants/nutrientGroups'
import { prefersReducedMotion } from '../utils/motion'

const FOODS_PER_GROUP = 4

function formatClock(seconds) {
  const total = Math.floor(seconds)

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5 20 12 7 19.5Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 4.5h4v15h-4Zm7 0h4v15h-4Z" />
    </svg>
  )
}

/**
 * 5대 영양소 보충 우선순위를 순회 재생한다.
 * 참고 HTML 의 "컷 리듬" 과 같은 구조다 (doc/nutrient-radar.md 4장)
 *
 * 매 프레임 setState 하면 초당 60번 리렌더된다.
 * 진행 막대와 시계는 DOM 에 직접 쓰고, 군이 바뀔 때만 상태를 갱신한다
 */
export default function NutrientPriority({ analysis }) {
  // 점수 내림차순. 순회 순서와 순위 뱃지가 이걸 쓴다
  const groups = useMemo(() => scoreNutrientGroups(analysis), [analysis])
  const general = useMemo(() => isGeneralOnly(analysis), [analysis])

  // 레이더의 축은 항상 같은 자리에 있어야 한다.
  // 점수 순으로 축을 재배치하면 데이터가 바뀔 때마다 축 위치가 달라져
  // 모양을 비교할 수 없고, 항상 시계 방향으로 줄어드는 뻔한 도형이 된다
  const axisGroups = useMemo(() => {
    const byKey = new Map(groups.map((group) => [group.key, group]))

    return NUTRIENT_GROUPS.map((group) => byKey.get(group.key)).filter(Boolean)
  }, [groups])

  const [index, setIndex] = useState(0)
  const [running, setRunning] = useState(() => !prefersReducedMotion())
  const [visible, setVisible] = useState(true)

  const hostRef = useRef(null)
  const clockRef = useRef(null)
  const rafRef = useRef(0)
  const prevRef = useRef(0)
  const elapsedRef = useRef(0)
  const indexRef = useRef(0)

  // 화면 밖이면 멈춘다. 보이지도 않는 애니메이션에 배터리를 쓰지 않는다
  useEffect(() => {
    const element = hostRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { threshold: 0 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  // 탭이 숨겨져도 멈춘다
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) setVisible(false)
      else if (hostRef.current) setVisible(true)
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    const count = groups.length
    if (!running || !visible || count === 0) return undefined

    prevRef.current = 0

    function paint() {
      const elapsedMs = elapsedRef.current * 1000

      if (hostRef.current) {
        const progress = (elapsedMs % STEP_MS) / STEP_MS
        hostRef.current.style.setProperty('--beat', progress.toFixed(3))
      }

      if (clockRef.current) {
        clockRef.current.textContent = formatClock(elapsedRef.current)
      }

      const nextIndex = Math.floor(elapsedMs / STEP_MS) % count

      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex
        setIndex(nextIndex)
      }
    }

    function loop(now) {
      if (!prevRef.current) prevRef.current = now

      // 탭 복귀 시 큰 dt 가 한 번에 들어와 여러 군을 건너뛰는 것을 막는다
      const delta = Math.min(0.25, (now - prevRef.current) / 1000)
      prevRef.current = now
      elapsedRef.current += delta

      paint()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafRef.current)
  }, [running, visible, groups.length])

  if (groups.length === 0) return null

  const current = groups[Math.min(index, groups.length - 1)]
  const foods = current.foods.slice(0, FOODS_PER_GROUP)

  return (
    <div className={styles.panel} ref={hostRef}>
      <div className={styles.head}>
        <span className={styles.title}>
          영양 우선순위
          {running && <span className={styles.live}>LIVE</span>}
        </span>

        <span className={styles.clock} ref={clockRef}>
          0:00
        </span>

        <button
          type="button"
          className={styles.playButton}
          onClick={() => setRunning((prev) => !prev)}
          aria-label={running ? '순회 재생 일시정지' : '순회 재생'}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? '일시정지' : '재생'}
        </button>
      </div>

      <div className={styles.body}>
        {/* 왼쪽: 왜 이 영양소인지 + 무엇을 먹으면 되는지 */}
        <div className={styles.info}>
          <div className={`${styles.groupHead} ${styles.swap}`} key={`head-${current.key}`}>
            <span className={styles.rank}>{index + 1}순위</span>
            <span className={styles.groupName}>{current.label}</span>
            <span className={styles.groupScore}>
              {current.score}
              <span className={styles.scoreUnit}>점</span>
            </span>
          </div>

          <div className={`${styles.block} ${styles.swap}`} key={`why-${current.key}`}>
            <span className={styles.blockTitle}>이 점수가 나온 이유</span>
            <div className={styles.reasons}>
              {current.reasons.length > 0 ? (
                current.reasons.map((reason) => (
                  <span
                    key={reason}
                    className={`${styles.reason} ${general ? styles.reasonCalm : ''}`}
                  >
                    {reason}
                  </span>
                ))
              ) : (
                <span className={`${styles.reason} ${styles.reasonCalm}`}>
                  걸린 항목 없음 — 기본 권장 수준
                </span>
              )}
            </div>
          </div>

          {current.nutrients.length > 0 && (
            <div className={`${styles.block} ${styles.swap}`} key={`nut-${current.key}`}>
              <span className={styles.blockTitle}>세부 영양소</span>
              <div className={styles.nutrientList}>
                {current.nutrients.map((nutrient) => (
                  <div className={styles.nutrient} key={nutrient.key}>
                    <span className={styles.nutrientName}>{nutrient.name}</span>
                    <span className={styles.nutrientWhy}>{nutrient.why}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {foods.length > 0 && (
            <div className={`${styles.block} ${styles.swap}`} key={`food-${current.key}`}>
              <span className={styles.blockTitle}>이런 음식으로 채우세요</span>
              <div className={styles.foods}>
                {foods.map((food) => (
                  <span className={styles.food} key={food}>
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 오각형 */}
        <div className={styles.chartSide}>
          <NutrientRadar groups={axisGroups} activeKey={current.key} />
          <p className={styles.chartNote}>
            섭취량을 잰 값이 아니라, 입력하신 수치를 근거로 매긴 <strong>보충 우선순위</strong>입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
