import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CheckCircle2, Circle, ChevronRight, Sparkles } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { getCurrentWeek } from '../../hooks/useProgress'
import { cn } from '../../lib/utils'
import { LIGHT_THEME } from '../../theme/colors'

export default function TodayFocusCard({ state, onToggle }: { state: ProgressState; onToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  const weekNum = getCurrentWeek(state)

  // Get ALL tasks for current week (not just first 3)
  const currentWeekTasks = useMemo(() => {
    for (const phase of roadmap.phases) {
      const week = phase.weeksData.find(w => w.number === weekNum)
      if (week) return { week, phase, allItems: week.items }
    }
    return null
  }, [weekNum])

  const doneCount = currentWeekTasks
    ? currentWeekTasks.allItems.filter(i => state.checked[i.id]).length
    : 0
  const totalCount = currentWeekTasks ? currentWeekTasks.allItems.length : 0
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const isComplete = doneCount === totalCount && totalCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl px-4 pt-6"
    >
      <div className={cn(
        'relative overflow-hidden rounded-2xl border shadow-sm',
        'border-coral/15 bg-white'
      )}>
        {/* Decorative gradient blob */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-coral/[0.04] blur-2xl" aria-hidden="true" />

        <div className="relative p-5 md:p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                isComplete ? 'bg-emerald-100' : 'bg-coral/10'
              )}>
                <CalendarDays className={cn('h-5 w-5', isComplete ? 'text-emerald-500' : 'text-coral')} />
              </div>
              <div>
                <h2 className={cn('text-base font-semibold', LIGHT_THEME.textPrimary)}>
                  Week {weekNum} — {currentWeekTasks?.week.title ?? 'Your Journey'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: LIGHT_THEME.textMuted }}>
                  {doneCount}/{totalCount} tasks complete
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mini progress bar */}
              <div className="hidden sm:block w-32">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', isComplete ? 'bg-emerald-400' : 'bg-coral')}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-right text-[10px] mt-0.5 tabular-nums" style={{ color: LIGHT_THEME.textMuted }}>{progressPct}%</p>
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  'rounded-lg p-2 transition',
                  'hover:bg-gray-100'
                )}
                aria-label={expanded ? 'Collapse tasks' : 'Expand tasks'}
              >
                <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="h-4 w-4" style={{ color: LIGHT_THEME.textMuted }} />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Compact task pills (always visible) */}
          {!expanded && currentWeekTasks && (
            <div className="flex flex-wrap gap-2">
              {currentWeekTasks.allItems.slice(0, 5).map(item => {
                const checked = state.checked[item.id]
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      checked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 line-through'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-coral/30 hover:bg-coral/5 hover:text-coral'
                    )}
                  >
                    {checked
                      ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : <Circle className="h-3.5 w-3.5" />
                    }
                    {item.label.length > 40 ? item.label.slice(0, 40) + '…' : item.label}
                  </button>
                )
              })}
              {totalCount > 5 && (
                <button
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-dashed border-gray-300 px-3 py-1.5 text-xs transition hover:border-coral/30 hover:text-coral"
                  style={{ color: LIGHT_THEME.textMuted }}
                >
                  +{totalCount - 5} more
                </button>
              )}
            </div>
          )}

          {/* Expanded task list */}
          <AnimatePresence>
            {expanded && currentWeekTasks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {currentWeekTasks.allItems.map((item, idx) => {
                    const checked = state.checked[item.id]
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => onToggle(item.id)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200',
                          checked
                            ? 'border-emerald-100 bg-emerald-50/50'
                            : 'border-gray-100 bg-white hover:border-coral/20 hover:bg-coral/[0.02]'
                        )}
                      >
                        <span className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                          checked ? 'border-emerald-400 bg-emerald-400' : 'border-gray-300 group-hover:border-coral/40'
                        )}>
                          {checked && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <span className={cn(
                          'flex-1 text-sm transition-all duration-300',
                          checked ? 'text-gray-400 line-through' : 'text-gray-700'
                        )}>
                          {item.label}
                        </span>
                        {checked && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] font-medium text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full"
                          >
                            Done
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All done celebration */}
          {isComplete && !expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">All done for this week! Time to rest up.</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
