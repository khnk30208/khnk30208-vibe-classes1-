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
