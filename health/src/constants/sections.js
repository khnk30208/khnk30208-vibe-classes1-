// 대시보드 섹션 정의. 섹션을 늘릴 때 이 배열에 항목만 추가한다.
// icon 값은 SectionDock 이 SVG 로 바꿔 그린다 (constants 에 JSX 를 두지 않는다)
export const SECTIONS = [
  { id: 'section-health', label: '건강', icon: 'heart' },
  { id: 'section-nutrients', label: '영양소', icon: 'leaf' },
  { id: 'section-foods', label: '음식', icon: 'bowl' },
  { id: 'section-exercise', label: '운동', icon: 'run' },
  { id: 'section-gym', label: '헬스장', icon: 'pin' },
  { id: 'section-records', label: '내기록', icon: 'chart' },
]
