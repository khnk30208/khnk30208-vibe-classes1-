// 순수 함수 유틸. 다른 레이어를 import 하지 않는다 (CLAUDE.md 3.1)

const EARTH_RADIUS_M = 6371000

function toRad(degrees) {
  return (degrees * Math.PI) / 180
}

// 두 좌표 사이의 직선 거리(m). Haversine
export function distanceInMeters(from, to) {
  if (!from || !to) return null

  const values = [from.lat, from.lng, to.lat, to.lng]
  if (!values.every(Number.isFinite)) return null

  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2

  const distance = 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)))

  return Number.isFinite(distance) ? Math.round(distance) : null
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return ''
  if (meters < 1000) return `${meters}m`

  return `${(meters / 1000).toFixed(1)}km`
}
