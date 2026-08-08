// 오늘 체크한 생활 습관. React 를 import 하지 않는다 (CLAUDE.md 3.1)
//
// 진행률을 지어내지 않는다. 사용자가 직접 체크한 것만 센다

const STORAGE_KEY = 'health:habits'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 오늘 체크한 항목 키 목록.
 * 날짜가 바뀌면 빈 목록을 돌려준다 (하루가 지나면 자동으로 초기화)
 */
export function getTodayChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const saved = JSON.parse(raw)
    if (saved?.date !== todayKey()) return []

    return Array.isArray(saved.checked) ? saved.checked : []
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export function toggleHabit(checked, key) {
  const next = checked.includes(key)
    ? checked.filter((item) => item !== key)
    : [...checked, key]

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: todayKey(), checked: next }),
    )
  } catch {
    // 저장소를 못 쓰면 이번 세션에만 유지된다
  }

  return next
}

export function getProgress(checkedCount, total) {
  if (!total) return 0

  return Math.round((checkedCount / total) * 100)
}
