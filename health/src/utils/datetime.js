// 순수 함수 유틸. 다른 레이어를 import 하지 않는다 (CLAUDE.md 3.1)

export function formatDateTime(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) return ''

  const pad = (value) => String(value).padStart(2, '0')

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}
