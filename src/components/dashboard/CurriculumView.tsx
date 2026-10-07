import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Layers,
} from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import type { ColumnId } from '../../types/learning'
import { cn } from '../../lib/utils'

interface Props {
  checkedItems: Record<string, boolean>
  onToggleChecked: (id: string) => void
  onSendToKanban: (itemId: string, col?: ColumnId) => void
  onSendProjectToKanban: (projectId: string, col?: ColumnId) => void
}

export default function CurriculumView({
  checkedItems,
  onToggleChecked,
  onSendToKanban,
  onSendProjectToKanban,
}: Props) {
  const [expandedPhase, setExpandedPhase] = useState<string>('phase-1')
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [targetColumn, setTargetColumn] = useState<ColumnId>('todo')

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-coral/10 p-2 text-coral">
                <BookOpen className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                16-Week Curriculum & Roadmap Explorer
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Explore the four foundational phases. Tick off topics or queue them straight onto your Kanban board.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Add to Column:</span>
            <select
              value={targetColumn}
              onChange={e => setTargetColumn(e.target.value as ColumnId)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="backlog">Backlog</option>
            </select>
          </div>
        </div>

        {/* Phase Pills Switcher */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roadmap.phases.map(phase => {
            const isExpanded = expandedPhase === phase.id
            const totalItems = phase.weeksData.reduce((acc, w) => acc + w.items.length, 0)
            const doneItems = phase.weeksData.reduce(
              (acc, w) => acc + w.items.filter(i => checkedItems[i.id]).length,
              0
            )
            const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

            return (
              <button
                key={phase.id}
                onClick={() => {
                  setExpandedPhase(phase.id)
                  setSelectedWeek(phase.weeksData[0]?.number || 1)
                }}
                className={cn(
                  'flex flex-col text-left rounded-xl border p-4 transition-all duration-200',
                  isExpanded
                    ? 'border-coral bg-coral/[0.04] shadow-sm dark:bg-coral/[0.08]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-bold uppercase tracking-wider', isExpanded ? 'text-coral' : 'text-slate-500')}>
                    Phase {phase.number}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{phase.weeks}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {phase.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doneItems}/{totalItems} items</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-coral transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Phase Details */}
      {(() => {
        const activePhase = roadmap.phases.find(p => p.id === expandedPhase) || roadmap.phases[0]
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Weeks Menu */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Phase {activePhase.number} Weeks
                </h3>
                <div className="space-y-1.5">
                  {activePhase.weeksData.map(week => {
                    const isSelected = selectedWeek === week.number
                    const doneCount = week.items.filter(i => checkedItems[i.id]).length
                    return (
                      <button
                        key={week.number}
                        onClick={() => setSelectedWeek(week.number)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition',
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm dark:bg-coral dark:text-white'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        <span className="truncate">Week {week.number}: {week.title}</span>
                        <span className={cn('text-[10px] rounded-md px-1.5 py-0.5', isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}>
                          {doneCount}/{week.items.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Projects in this phase */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Associated Projects
                  </h3>
                </div>
                <div className="space-y-2">
                  {activePhase.projectIds.map(pid => {
                    const project = roadmap.projects.find(p => p.id === pid)
                    if (!project) return null
                    return (
                      <div
                        key={project.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {project.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {project.description}
                        </p>
                        <button
                          onClick={() => onSendProjectToKanban(project.id, targetColumn)}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral transition hover:bg-coral hover:text-white"
                        >
                          <Plus className="h-3 w-3" /> Push Project to Kanban ({targetColumn})
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Active Week Tasks & Checklist */}
            <div className="lg:col-span-2 space-y-4">
              {(() => {
                const currentWeekData = activePhase.weeksData.find(w => w.number === selectedWeek) || activePhase.weeksData[0]
                return (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-coral">
                          Week {currentWeekData.number} Focus
                        </span>
                        <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                          {currentWeekData.title}
                        </h2>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {currentWeekData.items.length} Core Objectives
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {currentWeekData.items.map(item => {
                        const isDone = !!checkedItems[item.id]
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'group flex items-center justify-between rounded-xl border p-4 transition-all duration-200',
                              isDone
                                ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20'
                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white dark:border-slate-800/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/60'
                            )}
                          >
                            <label className="flex items-center gap-3.5 cursor-pointer flex-1 pr-4">
                              <button
                                type="button"
                                onClick={() => onToggleChecked(item.id)}
                                className="shrink-0 transition-transform active:scale-90"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300 hover:text-coral dark:text-slate-600" />
                                )}
                              </button>
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-200'
                                )}
                              >
                                {item.label}
                              </span>
                            </label>

                            <button
                              onClick={() => onSendToKanban(item.id, targetColumn)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-coral hover:text-coral dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-coral"
                              title={`Send to Kanban as ${targetColumn}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              To Kanban ({targetColumn})
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
