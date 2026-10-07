import { motion } from 'framer-motion'
import { Briefcase, FileText, MessageSquare, Flame, CheckCircle2, Circle } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { cn } from '../../lib/utils'

const CATEGORY_META: Record<string, { Icon: any; color: string; label: string }> = {
  github: { Icon: Briefcase, color: '#64748B', label: 'GitHub Portfolio' },
  resume: { Icon: FileText, color: '#3B82F6', label: 'Resume & Impact Framing' },
  linkedin: { Icon: MessageSquare, color: '#0EA5E9', label: 'LinkedIn & Thought Leadership' },
  interview: { Icon: Flame, color: '#8B5CF6', label: 'Whiteboarding & Scenarios' },
}

export default function JobSearchKit({
  state,
  onToggle,
}: {
  state?: ProgressState | { checked: Record<string, boolean> }
  onToggle?: (id: string) => void
}) {
  const categories = Array.from(new Set(roadmap.jobKit.map(j => j.category))) as string[]
  const checked = state?.checked || {}

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Job Search & Packaging Kit
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Start packaging your portfolio in Month 3 — do not wait until graduation.
            </p>
          </div>
        </div>
      </div>

      {/* Month 3 Strategy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Golden Strategy: Start Packaging in Month 3, Not After
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300/90">
              Job searches take longer than anticipated. Start polishing project READMEs and applying while you are building projects 4, 5, and 6. By the time you wrap up your capstone, you will have multiple interview loops in flight.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4 Category Checklists Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map(cat => {
          const meta = CATEGORY_META[cat] || { Icon: Briefcase, color: '#64748B', label: cat }
          const items = roadmap.jobKit.filter(j => j.category === cat)
          const Icon = meta.Icon

          return (
            <div
              key={cat}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
                  style={{ backgroundColor: meta.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {meta.label}
                </h3>
              </div>

              <div className="space-y-2 flex-1">
                {items.map(item => {
                  const isChecked = !!checked[item.id]
                  return (
                    <div
                      key={item.id}
                      onClick={() => onToggle && onToggle(item.id)}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition-all',
                        isChecked
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300'
                          : 'border-slate-100 bg-slate-50/60 text-slate-700 hover:border-slate-200 hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                      )}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 mt-0.5" />
                      )}
                      <span className={cn('flex-1 font-medium leading-relaxed', isChecked && 'line-through text-slate-400')}>
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Target Roles Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Primary Target Roles & Positioning
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Cloud Solutions Architect',
            'Lead Cloud Engineer',
            'Platform Infrastructure Architect',
            'Cloud Data Platform Architect',
            'Senior SRE / DevOps Architect',
          ].map(role => (
            <span
              key={role}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {role}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Target product engineering teams, Global Capability Centers (GCCs), and cloud partner practices.
        </p>
      </div>
    </div>
  )
}
