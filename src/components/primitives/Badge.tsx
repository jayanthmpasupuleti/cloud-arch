import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

const VARIANTS: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  slate: 'bg-white/[0.06] text-slate-300 border-white/10',
  outline: 'bg-transparent text-slate-400 border-white/10',
}

export function Badge({ children, variant = 'slate', className }: { children: ReactNode; variant?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-200',
        VARIANTS[variant] || VARIANTS.slate,
        className
      )}
    >
      {children}
    </span>
  )
}
