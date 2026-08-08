// 식품군 분류. 음식 카드가 이 순서대로 묶어 보여 준다
export const FOOD_CATEGORIES = [
  { key: 'meat', label: '육류', tone: 'alert' },
  { key: 'seafood', label: '해산물', tone: 'info' },
  { key: 'vegetable', label: '채소류', tone: 'ok' },
  { key: 'fruit', label: '과일류', tone: 'warn' },
  { key: 'grain', label: '곡류·서류', tone: 'warn' },
  { key: 'bean', label: '콩류', tone: 'ok' },
  { key: 'nut', label: '견과·씨앗', tone: 'warn' },
  { key: 'dairy', label: '유제품·달걀', tone: 'info' },
  { key: 'etc', label: '기타', tone: 'info' },
]

// 음식 → 식품군. assets/nutrients.json 의 foods 에 나오는 이름을 모두 덮는다.
// 여기 없는 음식은 '기타' 로 떨어진다
export const FOOD_TO_CATEGORY = {
  닭가슴살: 'meat',
  '돼지 안심': 'meat',
  '소고기 살코기': 'meat',
  소고기: 'meat',
  '닭 간': 'meat',
  순대: 'meat',

  연어: 'seafood',
  고등어: 'seafood',
  참치: 'seafood',
  굴: 'seafood',
  바지락: 'seafood',
  미역: 'seafood',
  멸치: 'seafood',

  브로콜리: 'vegetable',
  양배추: 'vegetable',
  시금치: 'vegetable',
  깻잎: 'vegetable',
  아스파라거스: 'vegetable',
  토마토: 'vegetable',
  케일: 'vegetable',
  표고버섯: 'vegetable',
  단호박: 'vegetable',

  사과: 'fruit',
  오렌지: 'fruit',
  바나나: 'fruit',
  아보카도: 'fruit',

  귀리: 'grain',
  보리밥: 'grain',
  현미: 'grain',
  고구마: 'grain',
  감자: 'grain',

  렌틸콩: 'bean',
  검은콩: 'bean',
  두부: 'bean',
  병아리콩: 'bean',

  호두: 'nut',
  아마씨: 'nut',
  치아씨드: 'nut',
  아몬드: 'nut',
  캐슈넛: 'nut',

  달걀: 'dairy',
  달걀노른자: 'dairy',
  그릭요거트: 'dairy',
  요거트: 'dairy',
  우유: 'dairy',
  '강화 우유': 'dairy',
  치즈: 'dairy',

  들기름: 'etc',
  다크초콜릿: 'etc',
}
