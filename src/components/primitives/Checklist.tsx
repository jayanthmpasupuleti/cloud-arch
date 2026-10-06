import { useState, type KeyboardEvent } from 'react'
import { Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { LIGHT_THEME } from '../../theme/colors'

export function Checklist({ items, checked, onToggle, accentColor }: {
  items: { id: string; label: string }[]
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  accentColor?: string
}) {
  const [filter, setFilter] = useState('')
  const visible = filter
    ? items.filter(i => i.label.toLowerCase().includes(filter.toLowerCase()))
    : items
  const doneCount = items.filter(i => checked[i.id]).length

  return (
    <div>
      {items.length > 3 && (
        <div className="mb-3 flex items-center gap-3">
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search items..."
            className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none"
            style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
            aria-label="Search checklist items"
          />
          <span className="text-xs tabular-nums" style={{ color: LIGHT_THEME.textMuted }}>{doneCount}/{items.length}</span>
        </div>
      )}
      <ul className="space-y-2" role="list">
        <AnimatePresence>
          {visible.map(item => {
            const isChecked = checked[item.id]
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onToggle(item.id)}
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(item.id) }
                  }}
                  className={cn(
                    'group flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200',
                    'focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:outline-none',
                    isChecked ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  )}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
                      isChecked
                        ? cn('border-current bg-coral', accentColor || 'text-coral')
                        : 'border-gray-300 group-hover:border-coral/40'
                    )}
                    aria-hidden="true"
                  >
                    {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className={cn('flex-1 transition-all duration-200', isChecked && 'text-gray-400 line-through')}>
                    {item.label}
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {visible.length === 0 && (
          <p className="py-4 text-center text-sm" style={{ color: LIGHT_THEME.textMuted }}>No matching items.</p>
        )}
      </ul>
    </div>
  )
}
