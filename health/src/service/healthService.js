// 건강 계산·판정. React 를 import 하지 않는다 (CLAUDE.md 3.1)
// 화면은 계산을 하지 않고 analyze() 결과만 그린다

import {
  ACTIVITY_LEVELS,
  BLOOD_TESTS,
  BMI_AXIS,
  BMI_LEVELS,
  BODY_FAT_AXIS,
  BODY_FAT_RANGES,
  INPUT_LIMITS,
  KCAL_PER_KG_FAT,
  SAFE_WEEKLY_LOSS,
  STANDARD_WEIGHT_FACTOR,
} from '../constants/healthCriteria'

// 빈 문자열을 Number() 하면 0 이 된다. 빈 값은 반드시 null 로 정규화한다
// (doc/health-analysis.md 2.6)
export function toNumberOrNull(value) {
  if (value === null || value === undefined) return null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function inRange(value, limit) {
  return value >= limit.min && value <= limit.max
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// 필수값 검사. 통과해야 계산에 들어간다
export function validateHealthInput(raw) {
  const gender = raw.gender
  if (gender !== 'male' && gender !== 'female') return '성별을 선택해 주세요.'

  const age = toNumberOrNull(raw.age)
  if (age === null) return '나이를 입력해 주세요.'
  if (!inRange(age, INPUT_LIMITS.age)) {
    return `나이는 ${INPUT_LIMITS.age.min}~${INPUT_LIMITS.age.max} 사이로 입력해 주세요.`
  }

  const heightCm = toNumberOrNull(raw.heightCm)
  if (heightCm === null) return '신장을 입력해 주세요.'
  if (!inRange(heightCm, INPUT_LIMITS.heightCm)) {
    return `신장은 ${INPUT_LIMITS.heightCm.min}~${INPUT_LIMITS.heightCm.max}cm 사이로 입력해 주세요.`
  }

  const weightKg = toNumberOrNull(raw.weightKg)
  if (weightKg === null) return '체중을 입력해 주세요.'
  if (!inRange(weightKg, INPUT_LIMITS.weightKg)) {
    return `체중은 ${INPUT_LIMITS.weightKg.min}~${INPUT_LIMITS.weightKg.max}kg 사이로 입력해 주세요.`
  }

  if (!ACTIVITY_LEVELS.some((level) => level.key === raw.activityKey)) {
    return '활동량을 선택해 주세요.'
  }

  // 선택 항목은 값이 있을 때만 범위를 본다
  const targetWeightKg = toNumberOrNull(raw.targetWeightKg)
  if (targetWeightKg !== null && !inRange(targetWeightKg, INPUT_LIMITS.targetWeightKg)) {
    return `목표 체중은 ${INPUT_LIMITS.targetWeightKg.min}~${INPUT_LIMITS.targetWeightKg.max}kg 사이로 입력해 주세요.`
  }

  const bodyFatPercent = toNumberOrNull(raw.bodyFatPercent)
  if (bodyFatPercent !== null && !inRange(bodyFatPercent, INPUT_LIMITS.bodyFatPercent)) {
    return `체지방률은 ${INPUT_LIMITS.bodyFatPercent.min}~${INPUT_LIMITS.bodyFatPercent.max}% 사이로 입력해 주세요.`
  }

  const dailyDeficitKcal = toNumberOrNull(raw.dailyDeficitKcal)
  if (dailyDeficitKcal !== null && !inRange(dailyDeficitKcal, INPUT_LIMITS.dailyDeficitKcal)) {
    return `하루 칼로리 적자는 ${INPUT_LIMITS.dailyDeficitKcal.min}~${INPUT_LIMITS.dailyDeficitKcal.max}kcal 사이로 입력해 주세요.`
  }

  return null
}

/* ============================================================
   혈액검사 슬라이더 (doc/input-slider.md)

   0 = 미입력(취소). 1~SLIDER_STEPS 가 실제 값에 대응한다.
   슬라이더의 정가운데가 "성별에 맞는 참고범위 중앙값" 이 되도록 좌우를 따로 매핑한다.
   범위를 한 번에 선형으로 늘리면 중앙값이 가운데에 오지 않거나
   축 하한이 음수가 되는 항목이 생긴다
   ============================================================ */

// 홀수여야 정중앙 칸이 생긴다. 짝수면 가운데가 두 칸 사이로 떨어져
// 평균값을 정확히 집을 수 없다
export const SLIDER_STEPS = 41

// 축 폭이 좁은 항목(헤모글로빈)만 소수 첫째 자리까지 쓴다
export function getBloodDecimals(test) {
  return test.axis.max - test.axis.min <= 30 ? 1 : 0
}

export function buildBloodSliderRange(test, gender) {
  const normal = test.normalByGender ? test.normalByGender[gender] : test.normal
  const low = normal?.min ?? test.axis.min
  const high = normal?.max ?? test.axis.max

  return {
    min: test.axis.min,
    max: test.axis.max,
    // 참고범위의 중앙값. 이 값이 슬라이더 정가운데에 온다
    center: (low + high) / 2,
  }
}

export function sliderStepToValue(step, range, decimals) {
  if (!Number.isFinite(step) || step <= 0) return null

  const t = (step - 1) / (SLIDER_STEPS - 1)
  const raw =
    t <= 0.5
      ? range.min + (range.center - range.min) * (t / 0.5)
      : range.center + (range.max - range.center) * ((t - 0.5) / 0.5)

  if (!Number.isFinite(raw)) return null

  const factor = 10 ** decimals

  return Math.round(raw * factor) / factor
}

export function valueToSliderStep(value, range) {
  const numeric = toNumberOrNull(value)
  if (numeric === null) return 0

  const t =
    numeric <= range.center
      ? ((numeric - range.min) / (range.center - range.min)) * 0.5
      : 0.5 + ((numeric - range.center) / (range.max - range.center)) * 0.5

  return clamp(Math.round(t * (SLIDER_STEPS - 1)) + 1, 1, SLIDER_STEPS)
}

export function calcBmi({ heightCm, weightKg }) {
  const meters = heightCm / 100
  if (!Number.isFinite(meters) || meters <= 0) return null

  const bmi = weightKg / (meters * meters)
  return Number.isFinite(bmi) ? round1(bmi) : null
}

export function findBmiLevel(bmi) {
  if (bmi === null) return null

  return BMI_LEVELS.find((item) => bmi < item.max) ?? null
}

export function judgeBmi(bmi) {
  const level = findBmiLevel(bmi)

  return level ? level.label : null
}

// BMI 게이지가 그릴 구간 목록. 마지막 구간의 Infinity 를 축 상한으로 바꿔 준다
export function getBmiBands() {
  let from = BMI_AXIS.min

  return BMI_LEVELS.map((level) => {
    const to = Math.min(level.max, BMI_AXIS.max)
    const band = { label: level.label, tone: level.tone, from, to }
    from = to
    return band
  })
}

export function calcStandardWeight({ heightCm, gender }) {
  const meters = heightCm / 100
  const factor = STANDARD_WEIGHT_FACTOR[gender]

  if (!Number.isFinite(meters) || meters <= 0 || !factor) return null

  return round1(meters * meters * factor)
}

// Mifflin-St Jeor
export function calcBmr({ gender, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = gender === 'male' ? base + 5 : base - 161

  return Number.isFinite(bmr) && bmr > 0 ? Math.round(bmr) : null
}

export function calcTdee(bmr, activityKey) {
  const level = ACTIVITY_LEVELS.find((item) => item.key === activityKey)
  if (bmr === null || !level) return null

  const tdee = bmr * level.factor
  return Number.isFinite(tdee) ? Math.round(tdee) : null
}

export function judgeBodyFat({ gender, bodyFatPercent }) {
  if (bodyFatPercent === null) return null

  const range = BODY_FAT_RANGES[gender]
  if (!range) return null

  let status = '참고 범위'
  let kind = 'ok'

  if (bodyFatPercent < range.min) {
    status = '참고 범위보다 낮음'
    kind = 'warn'
  } else if (bodyFatPercent > range.max) {
    status = '참고 범위보다 높음'
    kind = 'warn'
  }

  return {
    value: bodyFatPercent,
    status,
    kind,
    reference: `${range.min}~${range.max}%`,
    normal: range,
    axis: BODY_FAT_AXIS,
  }
}

// 특정 질병을 단정하지 않는다. 범위 안/밖과 상담 권고까지만 말한다 (CLAUDE.md 5장)
function judgeOne(test, value, normal) {
  if (test.caution && value >= test.caution.min && value <= test.caution.max) {
    return { status: '주의 구간 — 재확인 권고', kind: 'warn' }
  }

  if (normal.min !== undefined && value < normal.min) {
    return { status: '기준보다 낮음 — 상담 권고', kind: 'alert' }
  }

  if (normal.max !== undefined && value > normal.max) {
    return { status: '기준보다 높음 — 상담 권고', kind: 'alert' }
  }

  return { status: '정상 범위', kind: 'ok' }
}

export function judgeBloodTests({ gender, values }) {
  const results = []

  BLOOD_TESTS.forEach((test) => {
    const value = toNumberOrNull(values?.[test.key])
    // 입력하지 않은 항목은 건너뛴다. 에러로 막지 않는다
    if (value === null) return

    const normal = test.normalByGender ? test.normalByGender[gender] : test.normal
    if (!normal) return

    const judged = judgeOne(test, value, normal)

    results.push({
      key: test.key,
      label: test.label,
      unit: test.unit,
      value,
      status: judged.status,
      kind: judged.kind,
      reference: test.reference,
      normal: judged.kind === 'ok',
      // 그래프용
      normalRange: normal,
      axis: test.axis,
    })
  })

  return results
}

export function calcWeightGoal({ weightKg, targetWeightKg, dailyDeficitKcal }) {
  if (targetWeightKg === null) return null

  const diff = round1(weightKg - targetWeightKg)

  if (diff <= 0) {
    return {
      type: diff === 0 ? 'keep' : 'gain',
      diff: Math.abs(diff),
      targetWeightKg,
    }
  }

  // 적자가 0 이하면 기간을 계산하지 않는다 (0 나누기 방지)
  if (dailyDeficitKcal === null || dailyDeficitKcal <= 0) {
    return { type: 'lose', diff, targetWeightKg, days: null, weeks: null }
  }

  const days = Math.ceil((diff * KCAL_PER_KG_FAT) / dailyDeficitKcal)
  if (!Number.isFinite(days)) {
    return { type: 'lose', diff, targetWeightKg, days: null, weeks: null }
  }

  const weeks = Math.max(1, Math.round(days / 7))

  return {
    type: 'lose',
    diff,
    targetWeightKg,
    days,
    weeks,
    dailyDeficitKcal,
    weeklyPace: round1(diff / weeks),
    safePace: SAFE_WEEKLY_LOSS,
  }
}

// 화면이 쓰는 유일한 진입점
export function analyze(raw) {
  const gender = raw.gender
  const age = toNumberOrNull(raw.age)
  const heightCm = toNumberOrNull(raw.heightCm)
  const weightKg = toNumberOrNull(raw.weightKg)
  const activityKey = raw.activityKey

  const bmi = calcBmi({ heightCm, weightKg })
  const bmr = calcBmr({ gender, age, heightCm, weightKg })
  const standardWeight = calcStandardWeight({ heightCm, gender })
  const bmiLevel = findBmiLevel(bmi)

  return {
    gender,
    age,
    heightCm,
    weightKg,
    activityLabel:
      ACTIVITY_LEVELS.find((level) => level.key === activityKey)?.label ?? '',
    bmi,
    bmiLabel: bmiLevel ? bmiLevel.label : null,
    bmiTone: bmiLevel ? bmiLevel.tone : null,
    bmiBands: getBmiBands(),
    bmiAxis: BMI_AXIS,
    standardWeight,
    // 표준체중 대비 차이 (양수면 초과)
    weightGap:
      standardWeight === null || weightKg === null
        ? null
        : round1(weightKg - standardWeight),
    bmr,
    tdee: calcTdee(bmr, activityKey),
    bodyFat: judgeBodyFat({
      gender,
      bodyFatPercent: toNumberOrNull(raw.bodyFatPercent),
    }),
    bloodTests: judgeBloodTests({ gender, values: raw.bloodTests }),
    goal: calcWeightGoal({
      weightKg,
      targetWeightKg: toNumberOrNull(raw.targetWeightKg),
      dailyDeficitKcal: toNumberOrNull(raw.dailyDeficitKcal),
    }),
  }
}
