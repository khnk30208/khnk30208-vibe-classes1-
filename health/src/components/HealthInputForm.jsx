import { useState } from 'react'
import styles from './HealthInputForm.module.css'
import {
  ACTIVITY_LEVELS,
  BLOOD_TESTS,
  DEFAULT_ACTIVITY_KEY,
  DEFAULT_DAILY_DEFICIT,
  GENDERS,
} from '../constants/healthCriteria'

const EMPTY_FORM = {
  gender: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  activityKey: DEFAULT_ACTIVITY_KEY,
  targetWeightKg: '',
  dailyDeficitKcal: String(DEFAULT_DAILY_DEFICIT),
  bodyFatPercent: '',
  bloodTests: {},
}

// 입력만 담당한다. 검사·계산은 healthService 가 한다
export default function HealthInputForm({ initialValue, error, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValue ?? EMPTY_FORM)

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function setBloodTest(key, value) {
    setForm((prev) => ({
      ...prev,
      bloodTests: { ...prev.bloodTests, [key]: value },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>기본 정보</legend>

        <div className={styles.radioRow}>
          {GENDERS.map((gender) => (
            <label key={gender.key} className={styles.radio}>
              <input
                type="radio"
                name="gender"
                value={gender.key}
                checked={form.gender === gender.key}
                onChange={(e) => setField('gender', e.target.value)}
              />
              {gender.label}
            </label>
          ))}
        </div>

        <div className={styles.grid}>
          <label className={styles.label}>
            나이
            <input
              type="number"
              name="age"
              className={styles.input}
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
            />
          </label>

          <label className={styles.label}>
            신장 (cm)
            <input
              type="number"
              name="heightCm"
              step="0.1"
              className={styles.input}
              value={form.heightCm}
              onChange={(e) => setField('heightCm', e.target.value)}
            />
          </label>

          <label className={styles.label}>
            체중 (kg)
            <input
              type="number"
              name="weightKg"
              step="0.1"
              className={styles.input}
              value={form.weightKg}
              onChange={(e) => setField('weightKg', e.target.value)}
            />
          </label>

          <label className={styles.label}>
            활동량
            <select
              className={styles.select}
              name="activityKey"
              value={form.activityKey}
              onChange={(e) => setField('activityKey', e.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          목표
          <span className={styles.optional}>선택 · 비우면 생략됩니다</span>
        </legend>

        <div className={styles.grid}>
          <label className={styles.label}>
            목표 체중 (kg)
            <input
              type="number"
              name="targetWeightKg"
              step="0.1"
              className={styles.input}
              value={form.targetWeightKg}
              onChange={(e) => setField('targetWeightKg', e.target.value)}
            />
          </label>

          <label className={styles.label}>
            하루 칼로리 적자 (kcal)
            <input
              type="number"
              name="dailyDeficitKcal"
              className={styles.input}
              value={form.dailyDeficitKcal}
              onChange={(e) => setField('dailyDeficitKcal', e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          인바디
          <span className={styles.optional}>선택</span>
        </legend>

        <div className={styles.grid}>
          <label className={styles.label}>
            체지방률 (%)
            <input
              type="number"
              name="bodyFatPercent"
              step="0.1"
              className={styles.input}
              value={form.bodyFatPercent}
              onChange={(e) => setField('bodyFatPercent', e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          혈액검사
          <span className={styles.optional}>선택 · 입력한 항목만 해석합니다</span>
        </legend>

        <div className={styles.grid}>
          {BLOOD_TESTS.map((test) => (
            <label key={test.key} className={styles.label}>
              {test.label} ({test.unit})
              <input
                type="number"
                name={`blood_${test.key}`}
                step="0.1"
                className={styles.input}
                value={form.bloodTests?.[test.key] ?? ''}
                onChange={(e) => setBloodTest(test.key, e.target.value)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          분석하기
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  )
}
