import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { LIGHT_THEME } from '../../theme/colors'

export function Card({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-all duration-300',
        'hover:shadow-md',
        className
      )}
      style={{ borderColor: LIGHT_THEME.borderLight }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-5 pb-4', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-5', className)}>{children}</div>
}
