import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm',
        'transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>
}
