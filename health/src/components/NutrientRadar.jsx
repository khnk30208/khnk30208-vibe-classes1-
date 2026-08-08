import styles from './NutrientRadar.module.css'
import { MAX_SCORE } from '../constants/nutrientGroups'

// 그리기 좌표. 라벨이 바깥에 놓이므로 여백을 넉넉히 둔다
const CX = 130
const CY = 108
const RADIUS = 72
const LABEL_RADIUS = 96
const RINGS = [0.25, 0.5, 0.75, 1]

// 꼭지점 하나의 좌표. 12시 방향(-90도)에서 시작해 시계 방향으로 72도씩
function pointAt(index, ratio, count, radius = RADIUS) {
  const angle = ((-90 + (index * 360) / count) * Math.PI) / 180

  return {
    x: CX + Math.cos(angle) * radius * ratio,
    y: CY + Math.sin(angle) * radius * ratio,
  }
}

function toPolygon(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')
}

/**
 * 5대 영양소 보충 우선순위 레이더.
 * 값은 그래프에만 두지 않고 라벨에 숫자로 병기한다 (doc/design-system.md 6장)
 */
export default function NutrientRadar({ groups, activeKey }) {
  if (!groups?.length) return null

  const count = groups.length

  const ringPolygons = RINGS.map((ratio) =>
    toPolygon(groups.map((_, index) => pointAt(index, ratio, count))),
  )

  const shapePoints = groups.map((group, index) =>
    pointAt(index, Math.max(0, Math.min(group.score, MAX_SCORE)) / MAX_SCORE, count),
  )

  // 스크린리더에는 순위를 문장으로 전달한다
  const summary = [...groups]
    .sort((a, b) => b.score - a.score)
    .map((group, index) => `${index + 1}위 ${group.label} ${group.score}점`)
    .join(', ')

  return (
    <svg
      className={styles.chart}
      viewBox="0 0 260 215"
      role="img"
      aria-label={`영양소 보충 우선순위 오각형 그래프. ${summary}`}
    >
      {/* 배경 그리드 */}
      {ringPolygons.map((points, index) => (
        <polygon
          key={RINGS[index]}
          className={`${styles.ring} ${index === ringPolygons.length - 1 ? styles.ringOuter : ''}`}
          points={points}
        />
      ))}

      {groups.map((group, index) => {
        const outer = pointAt(index, 1, count)

        return (
          <line
            key={group.key}
            className={styles.axis}
            x1={CX}
            y1={CY}
            x2={outer.x}
            y2={outer.y}
          />
        )
      })}

      {/* 점수 다각형 — 중심에서 펴진다 */}
      <g className={styles.shape} style={{ '--cx': `${CX}px`, '--cy': `${CY}px` }}>
        <polygon className={styles.area} points={toPolygon(shapePoints)} />

        {shapePoints.map((point, index) => {
          const active = groups[index].key === activeKey

          return (
            <g key={groups[index].key}>
              {active && (
                <circle
                  className={styles.halo}
                  style={{ '--hx': `${point.x}px`, '--hy': `${point.y}px` }}
                  cx={point.x}
                  cy={point.y}
                  r="7"
                />
              )}
              <circle
                className={`${styles.dot} ${active ? styles.dotActive : ''}`}
                cx={point.x}
                cy={point.y}
                r={active ? 5.5 : 3.5}
              />
            </g>
          )
        })}
      </g>

      {/* 축 라벨 + 점수 */}
      {groups.map((group, index) => {
        const label = pointAt(index, 1, count, LABEL_RADIUS)
        const active = group.key === activeKey

        // 중심 기준 좌우 위치에 따라 정렬을 바꾼다. 안 그러면 라벨이 그래프를 침범한다
        const dx = label.x - CX
        const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end'

        return (
          <text key={group.key} x={label.x} y={label.y} textAnchor={anchor}>
            <tspan className={`${styles.label} ${active ? styles.labelActive : ''}`}>
              {group.label}
            </tspan>
            <tspan
              className={`${styles.score} ${active ? styles.scoreActive : ''}`}
              x={label.x}
              dy="14"
            >
              {group.score}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
