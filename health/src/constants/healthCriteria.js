// 건강 판정 기준표. work.md 2.3 에 확정된 값을 그대로 옮긴다.
// 계산 로직은 여기 두지 않는다 (service/healthService.js 담당)

export const GENDERS = [
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
]

// 대한비만학회 기준. bmi < max 로 위에서부터 찾는다.
// tone 은 게이지 색(순서형 램프) 번호다 (doc/design-system.md 3.3)
export const BMI_LEVELS = [
  { max: 18.5, label: '저체중', tone: 1 },
  { max: 23, label: '정상', tone: 2 },
  { max: 25, label: '과체중', tone: 3 },
  { max: 30, label: '비만 1단계', tone: 4 },
  { max: 35, label: '비만 2단계', tone: 5 },
  { max: Infinity, label: '비만 3단계', tone: 6 },
]

// BMI 게이지가 그리는 가로 축 범위. Infinity 를 그릴 수 없어 상한을 둔다
export const BMI_AXIS = { min: 15, max: 40 }

export const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: '거의 안 움직임', factor: 1.2 },
  { key: 'light', label: '가벼운 활동 (주 1~3회)', factor: 1.375 },
  { key: 'moderate', label: '보통 활동 (주 3~5회)', factor: 1.55 },
  { key: 'active', label: '활발한 활동 (주 6~7회)', factor: 1.725 },
  { key: 'veryActive', label: '매우 활발 (육체노동·2회 운동)', factor: 1.9 },
]

export const DEFAULT_ACTIVITY_KEY = 'moderate'

// 표준체중 = 신장(m)² × 계수
export const STANDARD_WEIGHT_FACTOR = { male: 22, female: 21 }

export const BODY_FAT_RANGES = {
  male: { min: 15, max: 20 },
  female: { min: 20, max: 28 },
}

// 체지방률 그래프의 가로 축
export const BODY_FAT_AXIS = { min: 5, max: 50 }

// 체지방 1kg 감량에 필요한 칼로리 적자
export const KCAL_PER_KG_FAT = 7700

export const DEFAULT_DAILY_DEFICIT = 500

// 주당 권장 감량 범위(kg)
export const SAFE_WEEKLY_LOSS = { min: 0.5, max: 1 }

// 혈액검사 참고 기준치. 진단 기준이 아니라 참고용이다 (work.md 2.3)
//
// min/max 는 포함(inclusive) 경계로 판정한다. 실제 검사값이 정수로 보고되는 항목은
// "200 미만" 을 max: 199 로 표현했다. 사용자에게는 reference 문구를 그대로 보여준다
// axis 는 그래프가 그리는 가로 축 범위다. 판정에는 쓰지 않는다
export const BLOOD_TESTS = [
  {
    key: 'fastingGlucose',
    label: '공복혈당',
    unit: 'mg/dL',
    normal: { min: 70, max: 99 },
    caution: { min: 100, max: 125 },
    reference: '70~99 mg/dL',
    axis: { min: 50, max: 180 },
  },
  {
    key: 'totalCholesterol',
    label: '총콜레스테롤',
    unit: 'mg/dL',
    normal: { max: 199 },
    reference: '200 mg/dL 미만',
    axis: { min: 100, max: 300 },
  },
  {
    key: 'ldl',
    label: 'LDL 콜레스테롤',
    unit: 'mg/dL',
    normal: { max: 129 },
    reference: '130 mg/dL 미만',
    axis: { min: 40, max: 220 },
  },
  {
    key: 'hdl',
    label: 'HDL 콜레스테롤',
    unit: 'mg/dL',
    normalByGender: { male: { min: 40 }, female: { min: 50 } },
    reference: '남 40 이상 / 여 50 이상',
    axis: { min: 20, max: 100 },
  },
  {
    key: 'triglyceride',
    label: '중성지방',
    unit: 'mg/dL',
    normal: { max: 149 },
    reference: '150 mg/dL 미만',
    axis: { min: 30, max: 300 },
  },
  {
    key: 'hemoglobin',
    label: '헤모글로빈',
    unit: 'g/dL',
    normalByGender: { male: { min: 13, max: 17 }, female: { min: 12, max: 16 } },
    reference: '남 13~17 / 여 12~16 g/dL',
    axis: { min: 8, max: 20 },
  },
]

// 입력 허용 범위 (doc/health-analysis.md 2.6 — 0 나누기·비정상값 차단)
export const INPUT_LIMITS = {
  age: { min: 1, max: 120 },
  heightCm: { min: 50, max: 250 },
  weightKg: { min: 10, max: 300 },
  targetWeightKg: { min: 10, max: 300 },
  bodyFatPercent: { min: 1, max: 70 },
  dailyDeficitKcal: { min: 1, max: 2000 },
}
