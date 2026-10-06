import { cn } from '../../lib/utils'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  colorClass?: string
  strokeColor?: string
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, label, sublabel, colorClass = 'text-coral', strokeColor }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={strokeColor || 'currentColor'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700 ease-out', colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className={cn('text-lg font-bold', colorClass)}>{label}</span>}
        {sublabel && <span className="text-[10px] text-gray-400">{sublabel}</span>}
      </div>
    </div>
  )
}
