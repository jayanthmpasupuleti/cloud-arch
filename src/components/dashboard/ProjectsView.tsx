import { useState } from 'react'
import {
  Layers,
  Star,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import type { ColumnId } from '../../types/learning'
import { cn } from '../../lib/utils'

interface Props {
  checkedItems: Record<string, boolean>
  onToggleChecked: (id: string) => void
  onSendProjectToKanban: (projectId: string, col?: ColumnId) => void
}

export default function ProjectsView({
  checkedItems,
  onToggleChecked,
  onSendProjectToKanban,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(roadmap.projects[0].id)
  const [addedProjectId, setAddedProjectId] = useState<string | null>(null)
  const activeProject = roadmap.projects.find(p => p.id === selectedProjectId) || roadmap.projects[0]

  const handleOpenInKanban = () => {
    onSendProjectToKanban(activeProject.id, 'inProgress')
    setAddedProjectId(activeProject.id)
    setTimeout(() => {
      setAddedProjectId(null)
    }, 3000)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                <Layers className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Hands-On Project Portfolio
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              6 Enterprise-Grade Projects + 1 Multi-Region DR Capstone.
            </p>
          </div>

          {/* The Golden Rule Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/20 max-w-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              The Golden Rule (4 Deliverables)
            </span>
            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
              1. Terraform code · 2. Architecture diagram · 3. Trade-offs README · 4. FinOps Cost Model
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selector List */}
        <div className="space-y-3">
          {roadmap.projects.map(proj => {
            const isSelected = proj.id === selectedProjectId
            const totalTasks = proj.checklist.length
            const doneTasks = proj.checklist.filter(i => checkedItems[i.id]).length
            const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 transition-all duration-200',
                  isSelected
                    ? 'border-coral bg-coral/[0.03] shadow-sm dark:bg-coral/[0.08]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                    proj.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  )}>
                    {proj.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-400">{proj.weeks}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {proj.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doneTasks}/{totalTasks} deliverables done</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
                </div>

                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-coral transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Project Full Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            {/* Project Title & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-coral">
                  {activeProject.weeks} · {activeProject.difficulty}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {activeProject.title}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={handleOpenInKanban}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200',
                    addedProjectId === activeProject.id
                      ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700'
                      : 'bg-coral shadow-coral/20 hover:bg-coral/90'
                  )}
                >
                  {addedProjectId === activeProject.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Added to Kanban (In Progress)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Open as Project in Kanban
                    </>
                  )}
                </button>
                {addedProjectId === activeProject.id && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    ✓ Milestone task created in "In Progress"
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Architectural Problem & Scope
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {activeProject.description}
              </p>
            </div>

            {/* Proof Statement */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <Star className="h-4 w-4 text-emerald-500" />
                What This Proves to Hiring Managers & Architects
              </div>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                {activeProject.proves}
              </p>
            </div>

            {/* Tech Stack Tags */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.techStack.map(t => (
                  <span
                    key={t}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 4 Golden Rule Deliverables */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                Mandatory Golden Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeProject.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-xs text-slate-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-slate-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Checklist Items */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Milestone Execution Checklist
              </h4>
              <div className="space-y-2">
                {activeProject.checklist.map(item => {
                  const isChecked = !!checkedItems[item.id]
                  return (
                    <div
                      key={item.id}
                      onClick={() => onToggleChecked(item.id)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition',
                        isChecked
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300'
                          : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isChecked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                        )}
                      />
                      <span className={cn('flex-1 font-medium', isChecked && 'line-through text-slate-400')}>
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
