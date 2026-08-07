// 순수 유틸. 다른 레이어를 import 하지 않는다 (CLAUDE.md 3.1)

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min

  return Math.min(Math.max(value, min), max)
}

// 값이 [min, max] 축에서 차지하는 위치를 0~100(%) 으로 바꾼다
export function toPercent(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0
  if (max <= min) return 0

  return clamp(((value - min) / (max - min)) * 100, 0, 100)
}
