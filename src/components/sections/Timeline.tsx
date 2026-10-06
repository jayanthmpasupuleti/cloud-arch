import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '../primitives/Badge'
import { ProgressRing } from '../primitives/ProgressRing'
import { roadmap, PHASE_COLORS } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

function PhaseAccordion({
  phase, progress, checked, onToggle, isExpanded, onToggleExpand, projectProgress
}: {
  phase: typeof roadmap.phases[0]
  progress: number
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  isExpanded: boolean
  onToggleExpand: () => void
  projectProgress: Record<string, number>
}) {
  const colors = PHASE_COLORS[phase.id as keyof typeof PHASE_COLORS]
  const variantMap: Record<string, string> = { 'phase-1': 'blue', 'phase-2': 'violet', 'phase-3': 'amber', 'phase-4': 'emerald' }

  return (
    <div className="mb-4">
      <button
        onClick={onToggleExpand}
        className="group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 hover:shadow-sm bg-white"
        style={{ borderColor: LIGHT_THEME.border }}
        aria-expanded={isExpanded}
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold shadow-md bg-gradient-to-br ${colors.gradient}`}>
          {phase.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{phase.title}</h3>
            <Badge variant={variantMap[phase.id] as any}>{phase.weeks}</Badge>
          </div>
          <p className="mt-0.5 text-sm truncate" style={{ color: LIGHT_THEME.textSecondary }}>{phase.subtitle}</p>
        </div>
        <div className="hidden md:block">
          <ProgressRing value={progress} size={44} strokeWidth={4} strokeColor={colors.text} />
        </div>
        <div style={{ color: LIGHT_THEME.textMuted }} className="transition-transform duration-300">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-b-2xl border-x border-b bg-white"
          style={{ borderColor: LIGHT_THEME.border }}
        >
          <div className="p-5 md:p-6">
            <p className="text-sm mb-6" style={{ color: LIGHT_THEME.textSecondary }}>{phase.description}</p>

            <div className="space-y-6">
              {phase.weeksData.map(week => {
                const weekDone = week.items.filter(i => checked[i.id]).length
                const weekTotal = week.items.length
                return (
                  <div key={week.number} className="rounded-xl border bg-white" style={{ borderColor: LIGHT_THEME.borderLight }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" style={{ color: LIGHT_THEME.textMuted }} />
                        <h4 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>Week {week.number}: {week.title}</h4>
                      </div>
                      <span className="text-xs tabular-nums" style={{ color: LIGHT_THEME.textMuted }}>{weekDone}/{weekTotal}</span>
                    </div>
                    <div className="space-y-1.5">
                      {week.items.map(item => {
                        const isChecked = checked[item.id]
                        return (
                          <label
                            key={item.id}
                            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 ${isChecked ? '' : 'hover:bg-gray-50'}`}
                            style={{ backgroundColor: isChecked ? LIGHT_THEME.bgSubtle : 'transparent' }}
                          >
                            <button type="button" onClick={() => onToggle(item.id)} className="mt-0.5 shrink-0">
                              {isChecked
                                ? <CheckCircle2 className="h-4 w-4 text-coral" />
                                : <Circle className="h-4 w-4 text-gray-300" />
                              }
                            </button>
                            <span className={`text-sm ${isChecked ? 'line-through' : ''}`} style={{ color: isChecked ? LIGHT_THEME.textMuted : LIGHT_THEME.textPrimary }}>{item.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {phase.projectIds.map(pid => {
                const proj = roadmap.projects.find(p => p.id === pid)
                if (!proj) return null
                const pp = projectProgress[pid] ?? 0
                return (
                  <div key={pid} className="rounded-xl border bg-white" style={{ borderColor: LIGHT_THEME.borderLight }}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{proj.title}</h4>
                      <Badge variant={variantMap[phase.id] as any}>{pp}%</Badge>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: LIGHT_THEME.textMuted }}>{proj.weeks} · {proj.checklist.length} tasks</p>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Timeline({ state, onToggle }: { state: ProgressState; onToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string>('phase-1')

  const projectProgress: Record<string, number> = {}
  for (const p of roadmap.projects) {
    const done = p.checklist.filter(i => state.checked[i.id]).length
    projectProgress[p.id] = p.checklist.length > 0 ? Math.round((done / p.checklist.length) * 100) : 0
  }

  return (
    <section id="timeline">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>16-Week Timeline</h2>
          <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>Click a phase to expand its weeks and project milestones.</p>
        </div>

        <div>
          {roadmap.phases.map(phase => {
            const allItems = phase.weeksData.flatMap(w => w.items)
            const done = allItems.filter(i => state.checked[i.id]).length
            const pct = allItems.length > 0 ? Math.round((done / allItems.length) * 100) : 0
            return (
              <PhaseAccordion
                key={phase.id}
                phase={phase}
                progress={pct}
                checked={state.checked}
                onToggle={onToggle}
                isExpanded={expanded === phase.id}
                onToggleExpand={() => setExpanded(expanded === phase.id ? '' : phase.id)}
                projectProgress={projectProgress}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
