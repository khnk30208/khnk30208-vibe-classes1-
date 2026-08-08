// 5대 영양소군. 오각형 레이더의 축이 된다 (doc/nutrient-radar.md 3장)
// 순서를 바꾸면 오각형의 축 위치가 바뀐다
export const NUTRIENT_GROUPS = [
  { key: 'carb', label: '탄수화물', tone: 1 },
  { key: 'protein', label: '단백질', tone: 2 },
  { key: 'fat', label: '지방', tone: 3 },
  { key: 'vitamin', label: '비타민', tone: 4 },
  { key: 'mineral', label: '무기질', tone: 5 },
]

// 기본선. 0 점이 생기면 오각형이 찌그러진 별이 되어
// "이 영양소는 필요 없다" 는 잘못된 인상을 준다. 5대 영양소는 모두 필요하다
export const BASE_SCORE = 30
export const MAX_SCORE = 100

// 가점
export const POINT_PER_NUTRIENT = 18
export const POINT_PER_REASON = 9

// 순회 재생에서 한 군이 조명되는 시간
export const STEP_MS = 2400
