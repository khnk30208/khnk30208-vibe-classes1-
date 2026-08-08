import { useEffect, useRef, useState } from 'react'

// 화면에 들어오면 한 번만 재생하고 관찰을 해제한다.
// IntersectionObserver 가 없으면 즉시 표시해 내용이 사라지지 않게 한다
export default function Reveal({
  as: Tag = 'div',
  index = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }

    // 마운트 시점에 이미 화면 안이거나 화면 위로 지나간 요소는 즉시 보여준다.
    // 스크롤을 내린 상태에서 화면이 바뀌면 위쪽에 붙은 요소가 관찰 대상이 되지 못해
    // 영영 투명하게 남는다 (모바일에서 결과 카드가 안 보이던 원인)
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (element.getBoundingClientRect().top < viewportHeight) {
      setShown(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          setShown(true)
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`rv ${shown ? 'in' : ''} ${className}`.trim()}
      style={{ '--i': index }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
