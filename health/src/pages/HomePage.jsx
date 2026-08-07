import { useState } from 'react'
import styles from './HomePage.module.css'
import HealthInputForm from '../components/HealthInputForm'
import HealthSummary from '../components/HealthSummary'
import Reveal from '../components/Reveal'
import { analyze, validateHealthInput } from '../service/healthService'
import { prefersReducedMotion } from '../utils/motion'

// 사용자 데이터가 없어도 되는 일반 생활 수칙이라 지금 채운다.
// 나머지 카드는 분석 엔진(work.md 단계 5~6)이 생긴 뒤 채운다
const LIFESTYLE_TIPS = [
  '물은 하루 1.5~2L 를 여러 번 나눠 마시기',
  '하루 7~8시간 규칙적으로 자기',
  '중강도 유산소 운동을 주 150분 이상 하기',
  '앉아 있는 시간 1시간마다 3~5분 일어나 움직이기',
  '매 끼니에 채소나 과일 한 가지 이상 곁들이기',
]

// 화면을 바꿀 때 맨 위로 되돌린다. 모션 설정을 존중해 부드러운 스크롤 여부를 가른다
function scrollToTop() {
  const smooth = !prefersReducedMotion()
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}

// 대시보드 카드 한 장. 이 페이지 안에서만 쓰므로 별도 파일로 빼지 않는다
function Card({ title, description, ready, wide, index, action, children }) {
  return (
    <Reveal
      as="section"
      index={index}
      className={`${styles.card} ${wide ? styles.cardWide : ''}`}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {!ready && <span className={styles.badge}>준비 중</span>}
        {action && (
          <>
            <div className={styles.headSpacer} />
            {action}
          </>
        )}
      </div>

      {description && <p className={styles.cardDescription}>{description}</p>}

      {children}
    </Reveal>
  )
}

// 메뉴 안에서의 화면 전환은 이 페이지가 담당한다 (CLAUDE.md 4.4)
export default function HomePage() {
  const [view, setView] = useState('dashboard')
  const [analysis, setAnalysis] = useState(null)
  const [lastInput, setLastInput] = useState(null)
  const [formError, setFormError] = useState('')

  function handleSubmit(form) {
    const message = validateHealthInput(form)

    // 검사를 통과하지 못하면 계산에 들어가지 않는다 (0 나누기·NaN 방지)
    if (message) {
      setFormError(message)
      return
    }

    setFormError('')
    setLastInput(form)
    setAnalysis(analyze(form))
    setView('dashboard')
    // 폼 아래쪽에서 제출했어도 결과는 처음부터 보이게 한다
    scrollToTop()
  }

  function goInput() {
    setFormError('')
    setView('input')
    scrollToTop()
  }

  if (view === 'input') {
    return (
      <div className={styles.page}>
        <div className={styles.inputHead}>
          <span className={styles.eyebrow}>STEP 01</span>
          <h1 className={styles.pageTitle}>건강정보 입력</h1>
          <p className={styles.lead}>
            기본 정보만 넣어도 분석됩니다. 목표·인바디·혈액검사는 비워 두면 해당
            항목만 결과에서 빠집니다.
          </p>
        </div>

        <HealthInputForm
          initialValue={lastInput}
          error={formError}
          onSubmit={handleSubmit}
          onCancel={() => setView('dashboard')}
        />

        <p className={styles.disclaimer}>
          입력한 건강 정보는 이 브라우저 안에서만 계산되며 외부로 전송되지 않습니다.
          결과는 일반적인 참고 정보이며 의학적 진단이 아닙니다.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>HEALTH DASHBOARD</span>
        <h1 className={styles.pageTitle}>
          오늘의 건강 상태를
          <br />한 화면에서 확인하세요
        </h1>
        <p className={styles.lead}>
          나이·신장·체중을 입력하면 BMI 구간, 기초대사량, 목표 체중까지 걸리는 기간을
          계산해 드립니다. 혈액검사 수치를 넣으면 참고 범위와 비교해 보여 줍니다.
        </p>
      </div>

      <div className={styles.grid}>
        {analysis ? (
          <Card
            title="건강"
            ready
            wide
            index={0}
            action={
              <button type="button" className={styles.cardButton} onClick={goInput}>
                다시 입력
              </button>
            }
          >
            <HealthSummary analysis={analysis} />
          </Card>
        ) : (
          <Card
            title="건강"
            description="나이·신장·체중을 입력하면 체중과 건강 상태 요약이 여기에 표시됩니다."
            ready
            index={0}
          >
            <button type="button" className={styles.primaryButton} onClick={goInput}>
              건강정보 입력하기
            </button>
          </Card>
        )}

        <Card
          title="필요한 영양소"
          description="분석 결과를 바탕으로 보충이 필요한 영양소를 알려드립니다."
          index={1}
        />

        <Card
          title="음식 추천"
          description="부족한 영양소가 풍부한 음식을 추천해 드립니다."
          index={2}
        />

        <Card title="생활 습관 팁" ready index={3}>
          <ul className={styles.tipList}>
            {LIFESTYLE_TIPS.map((tip) => (
              <li key={tip} className={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="주변 헬스장"
          description="접속 위치를 기준으로 가까운 헬스장을 찾아 지도에 표시합니다."
          index={4}
        />
      </div>

      {/* 결과가 표시될 때는 화면 안에서도 면책 문구를 다시 보여준다.
          결과가 없을 때는 Footer 의 상시 문구로 충분하다 (CLAUDE.md 5장) */}
      {analysis && (
        <p className={styles.disclaimer}>
          본 결과는 일반적인 참고 정보이며 의학적 진단이 아닙니다. 건강 이상이
          의심되면 반드시 의료 전문가와 상담하세요.
        </p>
      )}
    </div>
  )
}
