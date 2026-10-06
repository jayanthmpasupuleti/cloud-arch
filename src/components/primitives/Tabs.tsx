import { type ReactNode, useState } from 'react'
import { cn } from '../../lib/utils'

export function Tabs({ items, renderContent }: {
  items: { id: string; label: string; icon?: ReactNode }[]
  renderContent: (id: string) => ReactNode
}) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1" role="tablist">
        {items.map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:outline-none',
              active === item.id
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            )}
          >
            {item.icon && <span className="h-4 w-4">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">{renderContent(active)}</div>
    </div>
  )
}
