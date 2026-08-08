import styles from './ExerciseScatter.module.css'
import { TYPE_TONE, buildExerciseScatter, findBestValue } from '../service/exerciseService'

// 그리기 영역
const W = 520
const H = 300
const PAD = { left: 46, right: 14, top: 14, bottom: 42 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const IMPACT_MIN = 0.5
const IMPACT_MAX = 5.5
const IMPACT_TICKS = [1, 2, 3, 4, 5]

const DOT_CLASS = { info: styles.dotInfo, ok: styles.dotOk, warn: styles.dotWarn }

/**
 * 소모 열량 × 관절 부담 산점도.
 *
 * 강도(MET)와 소모 열량은 완전히 비례해 산점도가 직선이 된다.
 * 실제로 고를 때 고민되는 축(소모 vs 부담)을 쓴다 (exerciseService 주석 참고)
 */
export default function ExerciseScatter({ analysis }) {
  const points = buildExerciseScatter(analysis)

  if (points.length === 0) return null

  const maxBurn = Math.max(...points.map((point) => point.burn30))
  // 눈금이 깔끔하게 떨어지도록 50 단위로 올린다
  const xMax = Math.ceil(maxBurn / 50) * 50
  const xTicks = [0, xMax / 4, xMax / 2, (xMax * 3) / 4, xMax]

  const toX = (burn) => PAD.left + (burn / xMax) * PLOT_W
  const toY = (impact) =>
    PAD.top + PLOT_H - ((impact - IMPACT_MIN) / (IMPACT_MAX - IMPACT_MIN)) * PLOT_H

  const best = findBestValue(points)

  // 소모·부담이 완전히 같은 종목이 있다(등산 · 근력 강하게 둘 다 MET 6.0 / 부담 3).
  // 그대로 두면 점과 라벨이 정확히 포개진다. 좌우로 흩고 라벨을 위아래로 나눈다
  const placed = points.map((point) => {
    const twins = points.filter(
      (other) => other.burn30 === point.burn30 && other.impact === point.impact,
    )
    const order = twins.indexOf(point)
    const centered = order - (twins.length - 1) / 2

    return {
      ...point,
      dx: twins.length > 1 ? centered * 18 : 0,
      labelDy: twins.length > 1 && order % 2 === 1 ? 20 : -12,
    }
  })

  // 권장 영역: 소모 상위 절반 + 부담 2 이하
  const sweetX = toX(xMax / 2)
  const sweetY = toY(2.5)

  const summary = points
    .map((point) => `${point.name} ${point.burn30}kcal 부담 ${point.impactLabel}`)
    .join(', ')

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>30분 소모 열량 × 관절 부담</span>
        <span className={styles.count}>{points.length}개 종목</span>
      </div>

      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`운동 종목별 30분 소모 열량과 관절 부담 산점도. ${summary}`}
      >
        {/* 권장 영역 */}
        <rect
          className={styles.sweet}
          x={sweetX}
          y={sweetY}
          width={PAD.left + PLOT_W - sweetX}
          height={PAD.top + PLOT_H - sweetY}
          rx="6"
        />
        {/* 점이 몰리는 가운데를 피해 구간의 오른쪽 위에 붙인다 */}
        <text
          className={styles.sweetLabel}
          x={PAD.left + PLOT_W - 8}
          y={sweetY + 15}
          textAnchor="end"
        >
          부담 대비 소모가 좋은 구간
        </text>

        {/* 가로 눈금선 */}
        {IMPACT_TICKS.map((impact) => (
          <g key={impact}>
            <line
              className={styles.grid}
              x1={PAD.left}
              y1={toY(impact)}
              x2={PAD.left + PLOT_W}
              y2={toY(impact)}
            />
            <text
              className={styles.tick}
              x={PAD.left - 8}
              y={toY(impact) + 3.5}
              textAnchor="end"
            >
              {impact}
            </text>
          </g>
        ))}

        {/* 축 */}
        <line
          className={styles.axisLine}
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PLOT_H}
        />
        <line
          className={styles.axisLine}
          x1={PAD.left}
          y1={PAD.top + PLOT_H}
          x2={PAD.left + PLOT_W}
          y2={PAD.top + PLOT_H}
        />

        {xTicks.map((tick) => (
          <text
            key={tick}
            className={styles.tick}
            x={toX(tick)}
            y={PAD.top + PLOT_H + 16}
            textAnchor="middle"
          >
            {Math.round(tick)}
          </text>
        ))}

        <text
          className={styles.axisName}
          x={PAD.left + PLOT_W / 2}
          y={H - 8}
          textAnchor="middle"
        >
          30분 소모 열량 (kcal) →
        </text>
        <text
          className={styles.axisName}
          x={12}
          y={PAD.top + PLOT_H / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${PAD.top + PLOT_H / 2})`}
        >
          ← 관절 부담
        </text>

        {/* 점 */}
        {placed.map((point, index) => {
          const cx = toX(point.burn30) + point.dx
          const cy = toY(point.impact)

          return (
            <g key={point.key}>
              <circle
                className={`${styles.dot} ${DOT_CLASS[point.tone]}`}
                cx={cx}
                cy={cy}
                r="7"
                style={{ '--i': index }}
              />
              <text
                className={styles.dotLabel}
                x={cx}
                y={cy + point.labelDy}
                textAnchor="middle"
                style={{ '--i': index }}
              >
                {point.name}
              </text>
            </g>
          )
        })}
      </svg>

      <div className={styles.legend}>
        {Object.entries(TYPE_TONE).map(([type, tone]) => (
          <span
            className={styles.legendItem}
            key={type}
            style={{ '--c': `var(--${tone})` }}
          >
            <i />
            {type}
          </span>
        ))}
      </div>

      <div className={styles.keyPoint}>
        <span className={styles.keyBadge}>핵심</span>
        <p className={styles.keyText}>
          오른쪽 아래로 갈수록 <b>관절 부담은 적으면서 소모는 큰</b> 종목입니다.
          지금 체중 기준으로는 <b>{best.name}</b>이 부담 대비 소모가 가장 좋습니다
          (30분 {best.burn30}kcal · 부담 {best.impactLabel}). 소모만 보고 고르면
          무릎·발목이 먼저 지칩니다.
        </p>
      </div>
    </div>
  )
}
