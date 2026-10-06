import { useEffect, useRef, useState, useCallback } from 'react'

export function useScrollSpy(ids: string[], offset = 100) {
  const [active, setActive] = useState<string>(ids[0] ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })
  }, [ids, offset])

  useEffect(() => {
    setupObserver()
    return () => observerRef.current?.disconnect()
  }, [setupObserver])

  return active
}
