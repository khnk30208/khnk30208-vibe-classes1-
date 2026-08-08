// 분석 결과 → 보충하면 좋은 영양소 → 음식.
// React 를 import 하지 않는다 (CLAUDE.md 3.1)
//
// [중요] 특정 질병을 단정하지 않는다. 일반 영양 지침 수준까지만 쓴다 (CLAUDE.md 5장)

import nutrients from '../assets/nutrients.json'
import {
  BASE_SCORE,
  MAX_SCORE,
  NUTRIENT_GROUPS,
  POINT_PER_NUTRIENT,
  POINT_PER_REASON,
} from '../constants/nutrientGroups'
import { FOOD_CATEGORIES, FOOD_TO_CATEGORY } from '../constants/foodCategories'

const BY_KEY = new Map(nutrients.map((item) => [item.key, item]))

// 혈액검사 항목이 정상 범위를 벗어났는지
function isOff(bloodTests, key) {
  const test = bloodTests.find((item) => item.key === key)

  return Boolean(test) && test.kind !== 'ok'
}

function isLow(bloodTests, key) {
  const test = bloodTests.find((item) => item.key === key)

  return Boolean(test) && test.status.includes('낮음')
}

/**
 * 보충하면 좋은 영양소를 추린다.
 * 같은 영양소가 여러 이유로 걸리면 이유를 합쳐 한 번만 보여 준다.
 */
export function recommendNutrients(analysis) {
  if (!analysis) return []

  const bloodTests = analysis.bloodTests ?? []
  const picked = new Map()

  function add(key, reason) {
    const nutrient = BY_KEY.get(key)
    if (!nutrient) return

    const existing = picked.get(key)

    if (existing) {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason)
      return
    }

    picked.set(key, { ...nutrient, reasons: [reason] })
  }

  // 혈당
  if (isOff(bloodTests, 'fastingGlucose')) {
    add('fiber', '공복혈당이 참고 범위를 벗어났습니다')
    add('magnesium', '공복혈당이 참고 범위를 벗어났습니다')
  }

  // 지질
  if (isOff(bloodTests, 'totalCholesterol') || isOff(bloodTests, 'ldl')) {
    add('fiber', '콜레스테롤 수치가 참고 범위를 벗어났습니다')
    add('omega3', '콜레스테롤 수치가 참고 범위를 벗어났습니다')
  }

  if (isLow(bloodTests, 'hdl')) {
    add('omega3', 'HDL 콜레스테롤이 기준보다 낮습니다')
  }

  if (isOff(bloodTests, 'triglyceride')) {
    add('omega3', '중성지방이 참고 범위를 벗어났습니다')
    add('fiber', '중성지방이 참고 범위를 벗어났습니다')
  }

  // 빈혈 관련
  if (isLow(bloodTests, 'hemoglobin')) {
    add('iron', '헤모글로빈이 기준보다 낮습니다')
    add('b12', '헤모글로빈이 기준보다 낮습니다')
    add('folate', '헤모글로빈이 기준보다 낮습니다')
  }

  // 체형
  if (analysis.bmiTone !== null && analysis.bmiTone >= 4) {
    add('protein', '감량 중 근육 손실을 줄이기 위해서입니다')
    add('fiber', '포만감을 오래 유지하기 위해서입니다')
  }

  if (analysis.bmiTone === 1) {
    add('protein', '저체중 구간이라 체중을 늘리는 데 필요합니다')
    add('calcium', '저체중 구간에서는 뼈 건강도 함께 챙기는 것이 좋습니다')
    add('vitaminD', '저체중 구간에서는 뼈 건강도 함께 챙기는 것이 좋습니다')
  }

  if (analysis.bodyFat && analysis.bodyFat.status.includes('높음')) {
    add('protein', '체지방률이 참고 범위보다 높습니다')
  }

  // 나이
  if (Number.isFinite(analysis.age) && analysis.age >= 50) {
    add('calcium', '50세 이상에서는 뼈 손실 속도가 빨라집니다')
    add('vitaminD', '50세 이상에서는 뼈 손실 속도가 빨라집니다')
  }

  // 아무 조건에도 걸리지 않으면 일반 균형 식단을 권한다.
  // 이 경우와 "실제로 걸린 항목이 있는 경우" 를 화면에서 구분해야 하므로 표시를 남긴다
  let general = false

  if (picked.size === 0) {
    general = true
    add('protein', '현재 상태를 유지하는 데 기본이 되는 영양소입니다')
    add('fiber', '현재 상태를 유지하는 데 기본이 되는 영양소입니다')
    add('potassium', '짜게 먹는 식습관을 보완하는 데 도움이 됩니다')
  }

  return [...picked.values()].map((item) => ({ ...item, general }))
}

/**
 * 세부 영양소 추천을 5대 영양소군으로 접어 점수를 매긴다.
 * 오각형 레이더가 쓰는 유일한 진입점이다 (doc/nutrient-radar.md 3장)
 *
 * [중요] 이 점수는 "측정된 결핍" 이 아니라 "지금 신경 쓸 우선순위" 다.
 * 이 앱은 식사 기록을 받지 않으므로 섭취량을 추정하지 않는다.
 * 판정 규칙은 recommendNutrients() 한 곳에만 둔다. 여기서 새로 만들지 않는다
 */
export function scoreNutrientGroups(analysis) {
  const picked = recommendNutrients(analysis)

  const byGroup = new Map(
    NUTRIENT_GROUPS.map((group) => [
      group.key,
      { ...group, score: BASE_SCORE, reasons: [], nutrients: [], foods: [] },
    ]),
  )

  picked.forEach((nutrient) => {
    const bucket = byGroup.get(nutrient.group)
    if (!bucket) return

    bucket.nutrients.push(nutrient)
    bucket.score += POINT_PER_NUTRIENT

    // 같은 이유가 여러 영양소로 걸려도 한 번만 센다
    nutrient.reasons.forEach((reason) => {
      if (bucket.reasons.includes(reason)) return
      bucket.reasons.push(reason)
      bucket.score += POINT_PER_REASON
    })

    nutrient.foods.forEach((food) => {
      if (!bucket.foods.includes(food)) bucket.foods.push(food)
    })
  })

  const ranked = [...byGroup.values()].map((group) => ({
    ...group,
    score: Math.min(MAX_SCORE, Math.max(0, Math.round(group.score))),
  }))

  // 동점이면 NUTRIENT_GROUPS 순서를 따른다. 그러지 않으면 정렬이 실행마다 흔들린다
  const order = new Map(NUTRIENT_GROUPS.map((group, index) => [group.key, index]))

  return ranked.sort(
    (a, b) => b.score - a.score || order.get(a.key) - order.get(b.key),
  )
}

// 특별히 걸린 항목 없이 일반 균형 식단만 권한 상태인지
export function isGeneralOnly(analysis) {
  const picked = recommendNutrients(analysis)

  return picked.length > 0 && picked.every((nutrient) => nutrient.general)
}

/**
 * 추천 음식을 식품군으로 묶는다.
 * 음식 수가 많은 군을 앞에 둬서 "무슨 종류를 늘려야 하는지" 가 먼저 보이게 한다.
 */
export function groupFoodsByCategory(foods) {
  const buckets = new Map(
    FOOD_CATEGORIES.map((category) => [category.key, { ...category, foods: [] }]),
  )

  foods.forEach((food) => {
    const key = FOOD_TO_CATEGORY[food.name] ?? 'etc'
    const bucket = buckets.get(key) ?? buckets.get('etc')

    bucket.foods.push(food)
  })

  const order = new Map(FOOD_CATEGORIES.map((category, index) => [category.key, index]))

  return [...buckets.values()]
    .filter((bucket) => bucket.foods.length > 0)
    .sort(
      (a, b) => b.foods.length - a.foods.length || order.get(a.key) - order.get(b.key),
    )
}

/**
 * 추천 영양소에 들어 있는 음식을 모아 준다.
 * 같은 음식이 여러 영양소에 걸리면 그 영양소들을 함께 보여 준다.
 */
export function recommendFoods(pickedNutrients) {
  const foods = new Map()

  pickedNutrients.forEach((nutrient) => {
    nutrient.foods.forEach((food) => {
      const existing = foods.get(food)

      if (existing) {
        if (!existing.nutrients.includes(nutrient.name)) {
          existing.nutrients.push(nutrient.name)
        }
        return
      }

      foods.set(food, { name: food, nutrients: [nutrient.name] })
    })
  })

  // 여러 영양소를 한 번에 채우는 음식을 앞에 둔다
  return [...foods.values()].sort((a, b) => b.nutrients.length - a.nutrients.length)
}
