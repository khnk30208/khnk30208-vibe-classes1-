// 타임존별 날짜·시간 포맷. 다른 레이어를 import 하지 않는 순수 함수

function pick(parts, type) {
  return parts.find((part) => part.type === type)?.value ?? ''
}

// 2026.08.06 목
export function formatDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const ymd = [pick(parts, 'year'), pick(parts, 'month'), pick(parts, 'day')]
    .join('.')

  return `${ymd} ${pick(parts, 'weekday')}`
}

// 시·분과 초를 따로 돌려준다. 화면에서 크기를 다르게 주기 위한 것이다
export function formatTimeParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(date)

  return {
    meridiem: pick(parts, 'dayPeriod').toUpperCase(),
    hourMinute: `${pick(parts, 'hour')}:${pick(parts, 'minute')}`,
    second: pick(parts, 'second'),
  }
}
