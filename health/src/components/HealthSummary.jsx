import styles from './HealthSummary.module.css'
import CountUp from './CountUp'
import { BmiGauge, CompareBars, GoalProgress, RangeBar } from './HealthCharts'

// 화면에 그리기 직전 마지막 방어. NaN/Infinity/null 이 그대로 노출되지 않게 한다
// (doc/health-analysis.md 2.6)
function isNum(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function Metric({ label, value, unit, note, decimals = 0, tone = 'info' }) {
  return (
    <div className={styles.metric} style={{ '--c': `var(--${tone})` }}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>
        {isNum(value) ? <CountUp value={value} decimals={decimals} /> : '-'}
        {unit && <span className={styles.metricUnit}>{unit}</span>}
      </span>
      {note && <span className={styles.metricNote}>{note}</span>}
    </div>
  )
}

function weightGapText(gap) {
  if (!isNum(gap)) return '-'
  if (gap > 0) return `표준체중보다 ${gap}kg 많음`
  if (gap < 0) return `표준체중보다 ${Math.abs(gap)}kg 적음`
  return '표준체중과 동일'
}

function GoalText({ goal }) {
  if (!goal) return null

  if (goal.type === 'keep') {
    return <p className={styles.text}>목표 체중이 현재 체중과 같습니다. 지금 체중을 유지해 보세요.</p>
  }

  if (goal.type === 'gain') {
    return (
      <p className={styles.text}>
        목표 체중이 현재보다 <b>{goal.diff}kg</b> 많습니다. 감량이 아니라 증량 목표로 보입니다.
      </p>
    )
  }

  if (goal.days === null) return null

  const safe =
    goal.weeklyPace >= goal.safePace.min && goal.weeklyPace <= goal.safePace.max

  return (
    <p className={styles.note}>
      지금 속도는 주당 약{' '}
      <span className={safe ? styles.paceOk : styles.paceWarn}>{goal.weeklyPace}kg</span> 입니다.
      권장 범위는 주당 {goal.safePace.min}~{goal.safePace.max}kg 입니다.
    </p>
  )
}

export default function HealthSummary({ analysis }) {
  const activityBurn =
    isNum(analysis.tdee) && isNum(analysis.bmr) ? analysis.tdee - analysis.bmr : null

  return (
    <div className={styles.summary}>
      <div className={styles.metrics}>
        <Metric
          label="BMI"
          value={analysis.bmi}
          decimals={1}
          note={analysis.bmiLabel ?? '-'}
          tone={`bmi-${analysis.bmiTone ?? 2}`}
        />
        <Metric
          label="표준체중"
          value={analysis.standardWeight}
          unit="kg"
          decimals={1}
          note={weightGapText(analysis.weightGap)}
          tone="info"
        />
        <Metric
          label="기초대사량"
          value={analysis.bmr}
          unit="kcal"
          note="가만히 있어도 쓰는 열량"
          tone="ok"
        />
        <Metric
          label="활동대사량"
          value={analysis.tdee}
          unit="kcal"
          note={analysis.activityLabel || '-'}
          tone="info"
        />
      </div>

      {analysis.bmi !== null && (
        <div className={styles.section}>
          <BmiGauge
            bmi={analysis.bmi}
            label={analysis.bmiLabel}
            tone={analysis.bmiTone}
            bands={analysis.bmiBands}
            axis={analysis.bmiAxis}
          />
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>체중 · 열량 비교</h3>
          <span className={styles.sectionNote}>같은 축에서 비교합니다</span>
        </div>

        <div className={styles.stack}>
          <CompareBars
            items={[
              {
                label: '현재 체중',
                value: analysis.weightKg,
                unit: 'kg',
                decimals: 1,
                fill: 'fillInfo',
              },
              {
                label: '표준 체중',
                value: analysis.standardWeight,
                unit: 'kg',
                decimals: 1,
                fill: 'fillMuted',
              },
            ]}
          />

          <CompareBars
            items={[
              { label: '기초대사량', value: analysis.bmr, unit: 'kcal', fill: 'fillOk' },
              { label: '활동대사량', value: analysis.tdee, unit: 'kcal', fill: 'fillGrad' },
              {
                label: '활동 소모',
                value: activityBurn,
                unit: 'kcal',
                fill: 'fillMuted',
              },
            ]}
          />
        </div>
      </div>

      {analysis.goal && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>목표 체중</h3>
          </div>

          <div className={styles.stack}>
            <GoalProgress goal={analysis.goal} currentWeight={analysis.weightKg} />
            <GoalText goal={analysis.goal} />
          </div>
        </div>
      )}

      {analysis.bodyFat && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>체지방률</h3>
          </div>

          <RangeBar
            label="체지방률"
            value={analysis.bodyFat.value}
            unit="%"
            reference={analysis.bodyFat.reference}
            status={analysis.bodyFat.status}
            kind={analysis.bodyFat.kind}
            normalRange={analysis.bodyFat.normal}
            axis={analysis.bodyFat.axis}
          />
        </div>
      )}

      {analysis.bloodTests.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>혈액검사 해석</h3>
            <span className={styles.sectionNote}>
              입력한 {analysis.bloodTests.length}개 항목
            </span>
          </div>

          <div className={styles.testGrid}>
            {analysis.bloodTests.map((test) => (
              <RangeBar
                key={test.key}
                label={test.label}
                value={test.value}
                unit={test.unit}
                reference={test.reference}
                status={test.status}
                kind={test.kind}
                normalRange={test.normalRange}
                axis={test.axis}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
