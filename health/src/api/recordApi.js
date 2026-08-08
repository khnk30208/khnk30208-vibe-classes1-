// 건강 기록 저장소. localStorage 읽기·쓰기만 담당한다 (CLAUDE.md 3.1)

const STORAGE_KEY = 'health:records'

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function writeAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `r-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function fetchRecords() {
  return readAll()
}

export async function createRecord(record) {
  const saved = { ...record, id: createId(), savedAt: new Date().toISOString() }

  writeAll([...readAll(), saved])

  return saved
}

export async function deleteRecord(id) {
  const records = readAll()
  const next = records.filter((record) => record.id !== id)

  writeAll(next)

  return records.length !== next.length
}

export async function clearRecords() {
  localStorage.removeItem(STORAGE_KEY)

  return true
}
