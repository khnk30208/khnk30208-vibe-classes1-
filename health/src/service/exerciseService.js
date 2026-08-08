// 분석 결과 → 운동 추천 + 소모 열량.
// React 를 import 하지 않는다 (CLAUDE.md 3.1)

import exercises from '../assets/exercises.json'

// 표준 MET 공식: kcal = MET × 3.5 × 체중(kg) ÷ 200 × 분
export function calcBurn({ met, weightKg, minutes }) {
  if (![met, weightKg, minutes].every(Number.isFinite)) return null
  if (weightKg <= 0 || minutes <= 0) return null

  const kcal = ((met * 3.5 * weightKg) / 200) * minutes

  return Number.isFinite(kcal) ? Math.round(kcal) : null
}

// BMI 구간에 따라 어떤 성격의 운동을 앞에 둘지 정한다
function pickKeys(bmiTone) {
  // 저체중: 근력으로 체중을 늘리는 쪽
  if (bmiTone === 1) {
    return ['weightHeavy', 'weightLight', 'yoga', 'walk', 'swim']
  }

  // 과체중 이상: 관절 부담이 적은 유산소를 앞에 두고 근력을 곁들인다
  if (bmiTone !== null && bmiTone >= 3) {
    return ['walk', 'swim', 'cycle', 'weightLight', 'stairs', 'hike']
  }

  // 정상: 유산소와 근력을 고루
  return ['jog', 'weightLight', 'cycle', 'hike', 'yoga']
}

/**
 * 추천 운동 목록. 30분 기준 소모 열량과,
 * 목표 적자를 채우려면 몇 분이 필요한지를 함께 계산한다.
 */
export function recommendExercises(analysis) {
  if (!analysis || !Number.isFinite(analysis.weightKg)) return []

  const weightKg = analysis.weightKg
  const keys = pickKeys(analysis.bmiTone)
  const dailyDeficit = analysis.goal?.dailyDeficitKcal ?? null

  return keys
    .map((key) => exercises.find((item) => item.key === key))
    .filter(Boolean)
    .map((exercise) => {
      const burn30 = calcBurn({ met: exercise.met, weightKg, minutes: 30 })

      // 하루 적자를 이 운동만으로 채운다면 몇 분인지 (참고값)
      let minutesForGoal = null
      if (Number.isFinite(dailyDeficit) && dailyDeficit > 0 && burn30 && burn30 > 0) {
        minutesForGoal = Math.ceil((dailyDeficit / burn30) * 30)
      }

      return { ...exercise, burn30, minutesForGoal }
    })
}

// 주당 권장 유산소 시간 (일반 지침)
export const WEEKLY_AEROBIC_MINUTES = 150

// 운동 유형별 색. 산점도 범례가 쓴다
export const TYPE_TONE = {
  유산소: 'info',
  근력: 'ok',
  유연성: 'warn',
}

export const IMPACT_LABEL = {
  1: '매우 낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우 높음',
}

/**
 * 산점도용 데이터. 전체 운동을 훑는다 (추천 목록만이 아니라 비교가 목적)
 *
 * x = 30분 소모 열량, y = 관절 부담.
 * 강도(MET)와 소모 열량은 서로 완전히 비례해 산점도가 직선이 되므로 축으로 쓰지 않는다.
 * 실제로 고를 때 고민되는 것은 "소모는 큰데 관절이 버티느냐" 이므로 그 둘을 축으로 둔다
 */
// 목표 적자를 입력하지 않았을 때 쓸 기준 소모량
export const DEFAULT_TARGET_KCAL = 300

export function buildExerciseScatter(analysis) {
  if (!analysis || !Number.isFinite(analysis.weightKg)) return []

  const deficit = analysis.goal?.dailyDeficitKcal
  const targetKcal =
    Number.isFinite(deficit) && deficit > 0 ? deficit : DEFAULT_TARGET_KCAL

  return exercises
    .map((exercise) => {
      const burn30 = calcBurn({
        met: exercise.met,
        weightKg: analysis.weightKg,
        minutes: 30,
      })

      return {
        ...exercise,
        burn30,
        targetKcal,
        // 목표 열량을 이 운동만으로 채울 때 걸리는 시간
        minutesForTarget:
          Number.isFinite(burn30) && burn30 > 0
            ? Math.ceil((targetKcal / burn30) * 30)
            : null,
        tone: TYPE_TONE[exercise.type] ?? 'info',
        impactLabel: IMPACT_LABEL[exercise.impact] ?? '-',
      }
    })
    .filter((exercise) => Number.isFinite(exercise.burn30))
}

// 분을 "1시간 20분" 처럼 읽기 좋게
export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '-'
  if (minutes < 60) return `${minutes}분`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

// 부담 대비 소모가 가장 좋은 종목. 핵심 문구에 쓴다
export function findBestValue(points) {
  if (points.length === 0) return null

  return points.reduce((best, point) =>
    point.burn30 / point.impact > best.burn30 / best.impact ? point : best,
  )
}
