import { useEffect, useState } from 'react'
import styles from './HabitTips.module.css'
import { getProgress, getTodayChecked, toggleHabit } from '../service/habitService'

// 링 둘레 = 2πr (r = 24)
const CIRCUMFERENCE = 2 * Math.PI * 24

/**
 * 오늘의 생활 습관 체크리스트.
 * 사용자 데이터가 없어도 되는 일반 수칙이라 분석 전에도 쓸 수 있다.
 * 체크한 것만 세고 진행률을 지어내지 않는다
 */
export default function HabitTips({ tips }) {
  const [checked, setChecked] = useState([])

  // localStorage 는 첫 렌더 뒤에 읽는다 (서버 렌더 대비 + 초기 깜빡임 방지)
  useEffect(() => {
    setChecked(getTodayChecked())
  }, [])

  const done = tips.filter((tip) => checked.includes(tip.key)).length
  const progress = getProgress(done, tips.length)
  const offset = CIRCUMFERENCE * (1 - progress / 100)

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <svg className={styles.ring} viewBox="0 0 56 56" aria-hidden="true">
          <circle className={styles.ringTrack} cx="28" cy="28" r="24" />
          <circle
            className={styles.ringFill}
            cx="28"
            cy="28"
            r="24"
            style={{ '--offset': offset }}
          />
          <text
            className={styles.ringText}
            x="28"
            y="28"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {done}/{tips.length}
          </text>
        </svg>

        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>
            {progress === 100 ? '오늘 다 채웠습니다' : `오늘 ${progress}% 달성`}
          </span>
          <span className={styles.summaryNote}>
            눌러서 체크하세요. 날짜가 바뀌면 자동으로 초기화됩니다.
          </span>
        </span>
      </div>

      <div className={styles.list}>
        {tips.map((tip) => (
          <label className={styles.item} key={tip.key}>
            <input
              type="checkbox"
              checked={checked.includes(tip.key)}
              onChange={() => setChecked(toggleHabit(checked, tip.key))}
            />
            <span className={styles.box} aria-hidden="true" />
            <span className={styles.text}>{tip.text}</span>
          </label>
        ))}
      </div>

      <p className={styles.note}>체크는 이 브라우저에만 저장됩니다.</p>
    </div>
  )
}
