import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function PhaseSection({ id, children, className, label }: {
  id: string
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <section id={id} className={cn('relative scroll-mt-20 py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-400">
            {label}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" aria-hidden="true" />
        </div>
        {children}
      </div>
    </section>
  )
}
