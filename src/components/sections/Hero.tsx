import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Rocket, GitBranch, Layers } from 'lucide-react'
import { ProgressRing } from '../primitives/ProgressRing'
import type { ProgressState } from '../../hooks/useProgress'
import { roadmap } from '../../data/roadmap'
import { LIGHT_THEME } from '../../theme/colors'

export default function Hero({ state, onSetStartDate }: { state: ProgressState; onSetStartDate: () => void }) {
  const totalItems = useMemo(() => {
    return roadmap.phases.reduce((s, p) => s + p.weeksData.reduce((s2, w) => s2 + w.items.length, 0), 0)
      + roadmap.projects.reduce((s, p) => s + p.checklist.length, 0)
  }, [])
  const done = useMemo(() => {
    return roadmap.phases.reduce((s, p) => s + p.weeksData.reduce((s2, w) => s2 + w.items.filter(i => state.checked[i.id]).length, 0), 0)
      + roadmap.projects.reduce((s, p) => s + p.checklist.filter(i => state.checked[i.id]).length, 0)
  }, [state.checked])
  const pct = totalItems > 0 ? Math.round((done / totalItems) * 100) : 0

  const start = state.startDate ? new Date(state.startDate) : null
  const today = new Date()
  const dayOf112 = start
    ? Math.min(112, Math.max(1, Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1))
    : null

  return (
    <section id="hero" className="relative overflow-hidden px-4 pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl" style={{ color: LIGHT_THEME.textPrimary }}>
            From Data Engineer to{' '}
            <span className="bg-gradient-to-r from-coral to-amber-500 bg-clip-text text-transparent">
              Cloud Architect
            </span>{' '}
            in 16 Weeks
          </h1>

          <p className="mt-4 max-w-2xl text-sm md:text-base" style={{ color: LIGHT_THEME.textSecondary }}>
            Master GCP, AWS, Kubernetes, Terraform, and data platforms by building 6 kickass projects.
            Track your progress daily. Land the role.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <ProgressRing value={pct} size={80} strokeWidth={5} label={`${pct}%`} sublabel="complete" />
            <div className="flex flex-col gap-3 text-left">
              {dayOf112 ? (
                <div>
                  <span className="text-2xl font-bold" style={{ color: LIGHT_THEME.textPrimary }}>Day {dayOf112}</span>
                  <span className="text-sm ml-1" style={{ color: LIGHT_THEME.textMuted }}>of 112</span>
                </div>
              ) : (
                <button
                  onClick={onSetStartDate}
                  className="rounded-xl border border-coral/20 bg-coral/10 px-4 py-2.5 text-sm font-medium text-coral transition hover:bg-coral/15"
                >
                  Set Start Date
                </button>
              )}
              <div className="flex items-center gap-4 text-xs" style={{ color: LIGHT_THEME.textSecondary }}>
                <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-coral" /> 6 Projects</span>
                <span className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-coral" /> 4 Certs</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#phase-1"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-coral/20 transition hover:shadow-lg hover:shadow-coral/30"
            >
              <Rocket className="h-4 w-4" /> Start Week 1
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
              style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textSecondary }}
            >
              <Layers className="h-4 w-4" /> View Projects
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
