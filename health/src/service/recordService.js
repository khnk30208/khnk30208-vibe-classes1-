// 건강 기록 비지니스 로직. React 를 import 하지 않는다 (CLAUDE.md 3.1)

import * as recordApi from '../api/recordApi'

// 분석 결과에서 기록으로 남길 값만 추린다
export function toRecord(analysis) {
  if (!analysis) return null

  return {
    measuredAt: new Date().toISOString(),
    weightKg: analysis.weightKg ?? null,
    bmi: analysis.bmi ?? null,
    bmiLabel: analysis.bmiLabel ?? null,
    bodyFatPercent: analysis.bodyFat?.value ?? null,
    tdee: analysis.tdee ?? null,
  }
}

export async function getRecords() {
  const records = await recordApi.fetchRecords()

  // 오래된 것부터. 추이 차트가 왼쪽에서 오른쪽으로 흐른다
  return [...records].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  )
}

export async function saveRecord(analysis) {
  const record = toRecord(analysis)

  if (!record) throw new Error('저장할 분석 결과가 없습니다.')

  await recordApi.createRecord(record)

  return getRecords()
}

export async function removeRecord(id) {
  await recordApi.deleteRecord(id)

  return getRecords()
}

export async function removeAllRecords() {
  await recordApi.clearRecords()

  return []
}

/**
 * 추이 차트가 쓸 좌표를 만든다.
 * 값이 하나뿐이면 선을 그릴 수 없으므로 points 는 비워 두고 점만 남긴다.
 */
export function buildTrend(records, key) {
  const values = records
    .map((record) => record[key])
    .filter((value) => Number.isFinite(value))

  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  // 값이 전부 같으면 0 으로 나누게 된다. 폭을 1 로 잡아 가운데에 그린다
  const span = max - min || 1

  const points = records
    .map((record, index) => {
      const value = record[key]
      if (!Number.isFinite(value)) return null

      return {
        index,
        value,
        // 0~100 좌표계. 위가 큰 값이 되도록 y 를 뒤집는다
        x: records.length === 1 ? 50 : (index / (records.length - 1)) * 100,
        y: 100 - ((value - min) / span) * 100,
        measuredAt: record.measuredAt,
      }
    })
    .filter(Boolean)

  const first = values[0]
  const last = values[values.length - 1]

  return {
    points,
    min,
    max,
    first,
    last,
    change: Math.round((last - first) * 10) / 10,
  }
}
