import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

const VARIANTS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  violet: 'bg-violet-50 text-violet-600 border-violet-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  slate: 'bg-gray-100 text-gray-600 border-gray-200',
  outline: 'bg-transparent text-gray-500 border-gray-200',
  coral: 'bg-coral/10 text-coral border-coral/20',
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
