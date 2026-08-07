import { useEffect, useState } from 'react'
import styles from './RecordCard.module.css'
import { formatDateTime } from '../utils/datetime'
import {
  buildTrend,
  getRecords,
  hasRecordForToday,
  removeAllRecords,
  removeRecord,
  saveRecord,
} from '../service/recordService'

// 체중 추이 라인 차트. 라이브러리를 새로 설치하지 않고 인라인 SVG 로 그린다
function TrendChart({ trend }) {
  if (!trend || trend.points.length === 0) return null

  const line = trend.points.map((point) => `${point.x},${point.y}`).join(' ')
  // 선 아래를 채우는 면. 아래쪽 두 모서리를 붙여 닫는다
  const area = `0,100 ${line} 100,100`
  const last = trend.points[trend.points.length - 1]

  const changeClass =
    trend.change < 0 ? styles.down : trend.change > 0 ? styles.up : styles.flat

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartHead}>
        <span className={styles.chartTitle}>체중 추이</span>
        <span className={`${styles.change} ${changeClass}`}>
          {trend.change > 0 ? '+' : ''}
          {trend.change}kg
        </span>
      </div>

      <svg
        className={styles.chart}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={`체중 추이. 처음 ${trend.first}kg 에서 최근 ${trend.last}kg`}
      >
        {trend.points.length > 1 && (
          <>
            <polygon className={styles.area} points={area} />
            <polyline className={styles.line} points={line} />
          </>
        )}

        {trend.points.map((point) => (
          <circle
            key={point.measuredAt}
            className={`${styles.dot} ${point === last ? styles.dotLast : ''}`}
            cx={point.x}
            cy={point.y}
            r="2.5"
          />
        ))}
      </svg>

      {/* 가로축은 시간이다. 좌우에 최저·최고를 적으면 값 축으로 오해한다 */}
      <div className={styles.axis}>
        <span>처음 {trend.first}kg</span>
        <span>
          최저 {trend.min} · 최고 {trend.max}kg
        </span>
        <span>최근 {trend.last}kg</span>
      </div>
    </div>
  )
}

export default function RecordCard({ analysis }) {
  const [records, setRecords] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true

    getRecords().then((loaded) => {
      if (alive) setRecords(loaded)
    })

    return () => {
      alive = false
    }
  }, [])

  async function handleSave() {
    if (!analysis) return

    setSaving(true)
    try {
      setRecords(await saveRecord(analysis))
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    setRecords(await removeRecord(id))
  }

  async function handleClear() {
    setRecords(await removeAllRecords())
  }

  const trend = buildTrend(records, 'weightKg')
  // 같은 날 다시 저장하면 덮어쓴다. 버튼 문구로 미리 알린다
  const savedToday = hasRecordForToday(records)

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={handleSave}
          disabled={!analysis || saving}
        >
          {saving ? '저장 중...' : savedToday ? '오늘 기록 덮어쓰기' : '오늘 결과 저장'}
        </button>

        {records.length > 0 && (
          <button
            type="button"
            className={`${styles.ghost} ${styles.danger}`}
            onClick={handleClear}
          >
            전체 삭제
          </button>
        )}
      </div>

      {!analysis && (
        <p className={styles.notice}>
          건강정보를 먼저 입력하면 그 결과를 기록으로 저장할 수 있습니다.
        </p>
      )}

      {records.length === 0 ? (
        <p className={styles.empty}>저장된 기록이 없습니다.</p>
      ) : (
        <>
          <TrendChart trend={trend} />

          <div className={styles.list}>
            {[...records].reverse().map((record) => (
              <div className={styles.item} key={record.id}>
                <span className={styles.date}>{formatDateTime(record.measuredAt)}</span>

                <span className={styles.values}>
                  <span>
                    체중 <b>{record.weightKg ?? '-'}kg</b>
                  </span>
                  <span>
                    BMI <b>{record.bmi ?? '-'}</b>
                  </span>
                  {Number.isFinite(record.bodyFatPercent) && (
                    <span>
                      체지방 <b>{record.bodyFatPercent}%</b>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => handleRemove(record.id)}
                  aria-label="이 기록 삭제"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className={styles.notice}>
        기록은 하루에 한 줄만 남습니다. 같은 날 다시 저장하면 마지막 값으로
        덮어씁니다. 이 브라우저에만 저장되며 다른 기기에서는 보이지 않습니다.
      </p>
    </div>
  )
}
