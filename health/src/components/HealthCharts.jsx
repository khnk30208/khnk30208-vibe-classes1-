import styles from './HealthCharts.module.css'
import CountUp from './CountUp'
import { toPercent } from '../utils/motion'

// 건강 결과 그래프 모음. HealthSummary 에서만 쓰므로 한 파일에 모은다.
// 그래프에는 수치를 반드시 텍스트로 병기한다 (색각 이상·스크린리더 대응)

const KIND_CLASS = {
  ok: styles.ok,
  warn: styles.warn,
  alert: styles.alert,
}

const MARKER_CLASS = {
  ok: styles.markerOk,
  warn: styles.markerWarn,
  alert: styles.markerAlert,
}

// BMI 구간 게이지 + 내 위치 마커
export function BmiGauge({ bmi, label, tone, bands, axis }) {
  if (bmi === null || !bands?.length || !axis) return null

  const span = axis.max - axis.min
  const markerX = toPercent(bmi, axis.min, axis.max)
  // 구간 경계 눈금 (마지막 구간의 오른쪽 끝은 축 상한이라 표시하지 않는다)
  const ticks = bands.slice(0, -1).map((band) => band.to)

  return (
    <div className={styles.chart}>
      <div className={styles.chartHead}>
        <span className={styles.chartLabel}>BMI 구간</span>
        <span className={styles.chartValue}>
          <CountUp value={bmi} decimals={1} /> · {label}
        </span>
      </div>

      <div className={styles.gaugeWrap}>
        <div
          className={styles.marker}
          style={{ '--x': `${markerX}%` }}
          aria-hidden="true"
        >
          <span className={styles.markerValue}>{bmi}</span>
          <span className={styles.markerStem} />
        </div>

        <div
          className={styles.gauge}
          role="img"
          aria-label={`BMI ${bmi}, ${label} 구간`}
        >
          {bands.map((band) => (
            <span
              key={band.label}
              className={`${styles.band} ${styles[`band${band.tone}`]}`}
              style={{ width: `${((band.to - band.from) / span) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className={styles.ticks} aria-hidden="true">
        {ticks.map((tick) => (
          <span
            key={tick}
            className={styles.tick}
            style={{ '--x': `${toPercent(tick, axis.min, axis.max)}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div className={styles.legend}>
        {bands.map((band) => (
          <span
            key={band.label}
            className={`${styles.legendItem} ${band.tone === tone ? styles.legendOn : ''}`}
          >
            <i style={{ background: `var(--bmi-${band.tone})` }} />
            {band.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// 참고범위 위에 값 위치를 찍는다. 혈액검사·체지방률 공용
export function RangeBar({ label, value, unit, reference, status, kind, normalRange, axis }) {
  if (value === null || value === undefined || !axis) return null

  const from = toPercent(normalRange?.min ?? axis.min, axis.min, axis.max)
  const to = toPercent(normalRange?.max ?? axis.max, axis.min, axis.max)
  const markerX = toPercent(value, axis.min, axis.max)

  return (
    <div className={styles.chart}>
      <div className={styles.chartHead}>
        <span className={styles.chartLabel}>{label}</span>
        <span className={styles.chartValue}>
          {value}
          <span className={styles.barUnit}>{unit}</span>
        </span>
      </div>

      <div
        className={styles.rangeTrack}
        role="img"
        aria-label={`${label} ${value}${unit}, 참고 범위 ${reference}, ${status}`}
      >
        <span
          className={styles.rangeNormal}
          style={{ '--from': `${from}%`, '--span': `${Math.max(to - from, 1)}%` }}
        />
      </div>

      <div className={styles.rangeMarkerWrap} aria-hidden="true">
        <span
          className={`${styles.rangeMarker} ${MARKER_CLASS[kind] ?? styles.markerOk}`}
          style={{ '--x': `${markerX}%` }}
        />
      </div>

      <div className={styles.axis} aria-hidden="true">
        <span>{axis.min}</span>
        <span>참고 {reference}</span>
        <span>{axis.max}</span>
      </div>

      <span className={`${styles.status} ${KIND_CLASS[kind] ?? styles.ok}`}>{status}</span>
    </div>
  )
}

// 같은 축에서 두세 값을 비교하는 가로 막대
export function CompareBars({ items }) {
  const max = items.reduce(
    (acc, item) => (Number.isFinite(item.value) ? Math.max(acc, item.value) : acc),
    0,
  )

  if (max <= 0) return null

  return (
    <div className={styles.bars}>
      {items.map((item, index) => (
        <div className={styles.barRow} key={item.label}>
          <span className={styles.barLabel}>{item.label}</span>

          <div className={styles.barTrack}>
            <span
              className={`${styles.barFill} ${styles[item.fill] ?? styles.fillInfo}`}
              style={{ '--w': `${toPercent(item.value, 0, max)}%`, '--i': index }}
            />
          </div>

          <span className={styles.barValue}>
            <CountUp value={item.value} decimals={item.decimals ?? 0} />
            <span className={styles.barUnit}>{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// 현재 체중에서 목표 체중까지의 진행 막대
export function GoalProgress({ goal, currentWeight }) {
  if (!goal || goal.type !== 'lose') return null

  return (
    <div className={styles.goal}>
      <div className={styles.goalFigure}>
        {goal.days === null ? (
          <span className={styles.goalUnit}>
            하루 칼로리 적자를 입력하면 예상 기간을 계산해 드립니다.
          </span>
        ) : (
          <>
            <span className={styles.goalDays}>
              <CountUp value={goal.days} />
            </span>
            <span className={styles.goalUnit}>일 예상 (약 {goal.weeks}주)</span>
          </>
        )}
      </div>

      <div
        className={styles.goalTrack}
        role="img"
        aria-label={`현재 ${currentWeight}kg 에서 목표 ${goal.targetWeightKg}kg 까지 ${goal.diff}kg 남음`}
      >
        {/* 아직 시작 전이므로 진행률이 아니라 감량해야 할 폭을 보여준다 */}
        <span className={styles.goalFill} style={{ '--w': '100%' }} />
      </div>

      <div className={styles.goalEnds}>
        <span>
          목표 <b>{goal.targetWeightKg}kg</b>
        </span>
        <span>
          감량 <b>{goal.diff}kg</b>
        </span>
        <span>
          현재 <b>{currentWeight}kg</b>
        </span>
      </div>
    </div>
  )
}
