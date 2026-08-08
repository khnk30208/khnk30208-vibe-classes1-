import { useState } from 'react'
import styles from './HomePage.module.css'
import HealthInputForm from '../components/HealthInputForm'
import HealthSummary from '../components/HealthSummary'
import GymCard from '../components/GymCard'
import NutrientPriority from '../components/NutrientPriority'
import FoodGroups from '../components/FoodGroups'
import ExerciseScatter from '../components/ExerciseScatter'
import HabitTips from '../components/HabitTips'
import RecordCard from '../components/RecordCard'
import SectionDock from '../components/SectionDock'
import Reveal from '../components/Reveal'
import { analyze, validateHealthInput } from '../service/healthService'
import { recommendFoods, recommendNutrients } from '../service/nutritionService'
import { recommendExercises, WEEKLY_AEROBIC_MINUTES } from '../service/exerciseService'
import { SECTIONS } from '../constants/sections'
import { prefersReducedMotion } from '../utils/motion'

// 사용자 데이터가 없어도 되는 일반 생활 수칙이라 분석 전에도 채워 둔다
const LIFESTYLE_TIPS = [
  { key: 'water', text: '물은 하루 1.5~2L 를 여러 번 나눠 마시기' },
  { key: 'sleep', text: '하루 7~8시간 규칙적으로 자기' },
  {
    key: 'aerobic',
    text: `중강도 유산소 운동을 주 ${WEEKLY_AEROBIC_MINUTES}분 이상 하기`,
  },
  { key: 'move', text: '앉아 있는 시간 1시간마다 3~5분 일어나 움직이기' },
  { key: 'veggie', text: '매 끼니에 채소나 과일 한 가지 이상 곁들이기' },
]

// 화면을 바꿀 때 맨 위로 되돌린다. 모션 설정을 존중해 부드러운 스크롤 여부를 가른다
function scrollToTop() {
  const smooth = !prefersReducedMotion()
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}

// 대시보드 카드 한 장. 이 페이지 안에서만 쓰므로 별도 파일로 빼지 않는다.
//
// badge 는 세 상태를 구분한다
//   null        : 바로 쓸 수 있음
//   '입력 필요'  : 기능은 있고 건강정보만 넣으면 채워짐
//   '준비 중'    : 아직 안 만든 기능
// 둘을 같은 문구로 두면 만들어 둔 기능을 없는 줄 오해한다
function Card({ id, title, description, badge, wide, end, index, action, children }) {
  const needsInput = badge === '입력 필요'

  return (
    <Reveal
      as="section"
      id={id}
      index={index}
      className={[styles.card, wide ? styles.cardWide : '', end ? styles.cardEnd : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {badge && (
          <span className={`${styles.badge} ${needsInput ? styles.badgeInput : ''}`}>
            {badge}
          </span>
        )}
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

  // 분석 결과가 있어야 채울 수 있는 것들
  const nutrients = analysis ? recommendNutrients(analysis) : []
  const foods = analysis ? recommendFoods(nutrients) : []
  const exercises = analysis ? recommendExercises(analysis) : []

  return (
    <>
      <div className={styles.page}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>HEALTH DASHBOARD</span>
          <h1 className={styles.pageTitle}>
            오늘의 건강 상태를
            <br />한 화면에서 확인하세요
          </h1>
          <p className={styles.lead}>
            나이·신장·체중을 입력하면 BMI 구간, 기초대사량, 목표 체중까지 걸리는 기간을
            계산해 드립니다. 결과에 맞춰 영양소·음식·운동까지 이어서 알려 드립니다.
          </p>
        </div>

        <div className={styles.grid}>
          {analysis ? (
            <Card
              id="section-health"
              title="건강"
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
              id="section-health"
              title="건강"
              description="나이·신장·체중을 입력하면 체중과 건강 상태 요약이 여기에 표시됩니다."
              index={0}
            >
              <button type="button" className={styles.primaryButton} onClick={goInput}>
                건강정보 입력하기
              </button>
            </Card>
          )}

          <Card
            id="section-nutrients"
            title="필요한 영양소"
            badge={analysis ? null : '입력 필요'}
            wide={Boolean(analysis)}
            index={1}
            description={
              analysis
                ? undefined
                : '건강정보를 넣으면 혈액검사·체형·나이를 근거로 보충할 영양소를 골라 드립니다.'
            }
          >
            {analysis ? (
              <NutrientPriority analysis={analysis} />
            ) : (
              <button type="button" className={styles.linkButton} onClick={goInput}>
                건강정보 입력하기 →
              </button>
            )}
          </Card>

          <Card
            id="section-foods"
            title="음식 추천"
            badge={analysis ? null : '입력 필요'}
            wide={Boolean(analysis)}
            index={2}
            description={
              analysis
                ? '여러 영양소를 한 번에 채우는 음식을 앞에 뒀습니다.'
                : '보충할 영양소가 정해지면 그 영양소가 풍부한 음식을 묶어 보여 드립니다.'
            }
          >
            {analysis ? (
              <FoodGroups foods={foods} />
            ) : (
              <button type="button" className={styles.linkButton} onClick={goInput}>
                건강정보 입력하기 →
              </button>
            )}
          </Card>

          <Card
            id="section-exercise"
            title="운동 추천"
            badge={analysis ? null : '입력 필요'}
            wide={Boolean(analysis)}
            index={3}
            description={
              analysis
                ? '30분 기준 소모 열량은 입력하신 체중으로 계산한 값입니다.'
                : '체중을 넣으면 운동별 소모 열량을 계산하고, BMI 구간에 맞는 종목을 앞에 둡니다.'
            }
          >
            {analysis ? (
              <>
                <ExerciseScatter analysis={analysis} />

                <div className={styles.exerciseList}>
                  {exercises.map((exercise) => (
                    <div className={styles.exercise} key={exercise.key}>
                      <span className={styles.exerciseName}>{exercise.name}</span>
                      <span className={styles.exerciseBurn}>
                        {exercise.burn30 ?? '-'} kcal / 30분
                      </span>
                      <span className={styles.exerciseMeta}>
                        <span className={styles.pill}>{exercise.type}</span>
                        <span className={styles.pill}>{exercise.intensity}</span>
                        {exercise.note}
                        {exercise.minutesForGoal
                          ? ` 목표 적자를 이 운동만으로 채우면 약 ${exercise.minutesForGoal}분입니다.`
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <button type="button" className={styles.linkButton} onClick={goInput}>
                건강정보 입력하기 →
              </button>
            )}
          </Card>

          <Card id="section-gym" title="주변 헬스장" index={4} wide>
            <GymCard />
          </Card>

          <Card id="section-records" title="내기록" index={5} wide>
            <RecordCard analysis={analysis} />
          </Card>

          {/* 마지막 줄의 오른쪽 끝 빈 자리에 놓는다 */}
          <Card title="오늘의 습관" index={6} end>
            <HabitTips tips={LIFESTYLE_TIPS} />
          </Card>
        </div>

        {/* 결과가 표시될 때는 화면 안에서도 면책 문구를 다시 보여준다 (CLAUDE.md 5장) */}
        {analysis && (
          <p className={styles.disclaimer}>
            본 결과는 일반적인 참고 정보이며 의학적 진단이 아닙니다. 건강 이상이
            의심되면 반드시 의료 전문가와 상담하세요.
          </p>
        )}
      </div>

      {/* 독은 대시보드에서만 띄운다 (doc/section-nav.md 2.5) */}
      <SectionDock sections={SECTIONS} />
    </>
  )
}
