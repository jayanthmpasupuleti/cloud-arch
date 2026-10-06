import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { LIGHT_THEME } from '../../theme/colors'

export function PhaseSection({ id, children, className, label }: {
  id: string
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <section id={id} className={cn('relative scroll-mt-20 py-12', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: LIGHT_THEME.border, backgroundColor: LIGHT_THEME.bgSubtle, color: LIGHT_THEME.textSecondary }}>
            {label}
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${LIGHT_THEME.border}, transparent)` }} aria-hidden="true" />
        </div>
        {children}
      </div>
    </section>
  )
}
