import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

// 0 에서 목표값까지 세어 올린다.
// 값이 없거나 유한하지 않으면 '-' 를 보여준다 (doc/health-analysis.md 2.6)
export default function CountUp({
  value,
  decimals = 0,
  duration = 620,
  suffix = '',
  className = '',
}) {
  const target = Number.isFinite(value) ? value : null
  const [shown, setShown] = useState(target ?? 0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (target === null) return undefined

    if (prefersReducedMotion()) {
      setShown(target)
      return undefined
    }

    let startedAt = 0

    function step(now) {
      if (!startedAt) startedAt = now

      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - (1 - progress) ** 3

      setShown(target * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  if (target === null) {
    return <span className={className}>-</span>
  }

  return (
    <span className={`tnum ${className}`.trim()}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  )
}
